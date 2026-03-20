# ADR-001: DAG-Based Workflow Orchestration

## Status

Proposed

## Context

The RenRe Developer Workflow extension aims to provide a structured, multi-agent approach to software development tasks. Developers working with AI assistants typically jump straight to implementation without adequate scoping, research, or validation. This leads to incomplete solutions, missed edge cases, and wasted iteration cycles.

A workflow orchestration model is needed that scales from trivial one-line fixes to complex multi-file features while maintaining appropriate ceremony at each level. The orchestration must coordinate multiple AI agents working in parallel, manage phase transitions, and ensure quality gates are met before advancing.

Three orchestration models were evaluated: linear pipelines, full DAG (Directed Acyclic Graph), and hybrid approaches.

## Decision

Adopt a **full DAG-based orchestration model** for all workflow tiers. Every task — regardless of complexity — follows a directed acyclic graph of phases where nodes represent work units and edges represent dependencies. The graph shape varies by tier:

- **Quick Fix**: Degenerate single-path DAG (classify → scout → implement → validate → retrospective)
- **Bug Fix**: DAG with parallel investigation branches that merge before planning (classify → parallel investigate → merge → plan → implement → validate → retrospective)
- **Complex Task**: Multi-phase DAG with parallel branches in both research and implementation phases (classify → parallel research → merge → plan → review plan → parallel implement → integrate → validate → gap analysis → address gaps → final validate → retrospective)

### Key Design Points

- Each DAG node maps to a **phase** with defined inputs, outputs, and success criteria
- Phases that have no data dependencies run in **parallel** using separate AI agents
- A **merge node** always follows parallel branches to synthesize findings before the next sequential phase
- The **orchestrator skill** owns the DAG definition and manages phase transitions
- All intermediate outputs are persisted to the plan directory (`.renre-kit/plan/{name}/`) enabling resume-after-interruption
- Every DAG terminates with a **validation phase** (lint, typecheck, tests, duplication) and an **auto-generated retrospective**

### DAG Node Types

| Node Type | Behavior | Examples |
|-----------|----------|---------|
| **Sequential** | Runs after all predecessors complete | Classify, Plan, Integrate |
| **Parallel** | Runs concurrently with sibling nodes | Research agents, Implementation agents |
| **Merge** | Reads all parallel outputs, produces synthesis | Merged findings, Integration check |
| **Gate** | Blocks progression until criteria are met | Validation pass, Plan approval |

### Abort and Failure Handling

Failure handling combines **CLI commands** (deterministic enforcement) with **SKILL.md instructions** (LLM judgment). The commands handle structural operations; the SKILL.md guides the decision of *when* to abort.

**Abort conditions** — the orchestrator should stop the workflow and report to the user when:

- Research phase concludes that the task is **infeasible** (e.g., required API doesn't exist, architectural constraint prevents the change)
- `workflow:validate` returns `retry_count >= 3` — the command tracks this deterministically
- The user explicitly requests cancellation

**On abort**, the SKILL.md instructs the orchestrator to call `workflow:abort --reason {reason}`, which:

1. Updates `PLAN.md` with an `## Aborted` section including the reason and timestamp
2. Appends a final entry to `progress.md` with status `aborted` and last completed phase
3. Returns a prompt to the orchestrator to generate `RETROSPECTIVE.md` — aborted workflows produce valuable learnings
4. Reports the abort reason to the user

**Validation retry budget** — the `workflow:validate` command runs the full suite (lint, typecheck, tests, duplication), appends results to `review/validation-report.md`, and tracks the retry count. When `retry_count >= 3` on the same failure category, the command returns `exitCode: 1` with `"retry limit reached"` in the output. The SKILL.md instructs: "If `workflow:validate` reports retry limit reached, stop and ask the user whether to continue, change approach, or abort."

### Resume Protocol

Workflows may be interrupted (session timeout, user closes terminal, context window exhaustion). The plan directory and CLI commands enable resume:

1. The `SessionStart` hook runs `workflow:context`, which detects active workflows automatically
2. If an active workflow exists, the hook output includes: plan name, tier, last completed phase, next expected phase, and relevant memory context
3. The SKILL.md instructs: "If you receive active workflow context at session start, resume that workflow from the indicated next phase"
4. The orchestrator reads existing output files in the plan directory to reconstruct detailed context
5. Calls `workflow:progress --phase {phase} --status resumed` to record the resumption

**Manual resume** — the user can also explicitly invoke `workflow:status` to see the state of all workflows, and the SKILL.md includes a `workflow:resume` instruction pattern.

**Limitation:** Resume quality depends on how well the new LLM session can reconstruct intent from the plan files. The structured `progress.md` format and session hook provide the skeleton; the plan directory files provide the substance.

### Agent-to-Node Mapping

| Tier | Max Parallel Agents | Total Agents (across all phases) |
|------|-------------------|----------------------------------|
| Quick Fix | 1 | 1–2 |
| Bug Fix | 3 | 3–4 |
| Complex Task | 4–5 | 5–6 |

## Consequences

### Positive

- **Uniform model** — one mental model for all tiers; quick fixes are simply degenerate DAGs rather than a separate system
- **Parallelism** — research and implementation phases exploit concurrent agents, reducing wall-clock time for complex tasks
- **Resumability** — file-based intermediate outputs allow interrupted workflows to resume from the last completed node
- **Auditable** — the DAG structure and all node outputs are persisted, making it easy to trace how a solution was reached
- **Extensible** — new node types or phases can be inserted into the DAG without restructuring existing workflows

### Negative

- **Overhead for trivial tasks** — even quick fixes pay the cost of DAG classification and retrospective generation, though this is minimal (seconds)
- **Merge complexity** — synthesizing parallel agent outputs requires careful prompt engineering to avoid losing findings or creating contradictions
- **Coordination cost** — managing parallel agents through SKILL.md instructions relies on the host LLM correctly spawning and collecting agent results
- **No runtime DAG engine** — the DAG is encoded in SKILL.md instructions rather than a formal execution engine, meaning the LLM must interpret and follow the graph faithfully. CLI commands (ADR-005) enforce structural invariants but not traversal order

## Alternatives Considered

### Linear Pipeline

Sequential phases only (classify → research → plan → implement → validate). Simpler to implement but loses parallelism benefits. A complex task with 4 research directions would take 4x longer. Rejected because the primary value proposition is concurrent multi-agent work.

### Hybrid (DAG for complex only)

Use linear pipelines for quick fix and bug fix, DAG only for complex tasks. This reduces overhead for simple tasks but introduces two different orchestration models, increasing cognitive load for skill authors and making the orchestrator routing logic more complex. Rejected in favor of a single uniform model where simpler tiers are degenerate cases of the full DAG.

## Related Decisions

- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md)
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md)
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md)
- [ADR-005: Prompt-Based Orchestration Constraints](ADR-005-prompt-based-orchestration-constraints.md)
- [ADR-006: Extension Manifest and Agent Asset Structure](ADR-006-extension-manifest-and-agent-assets.md)
- [ADR-001: SKILL.md Convention](../llm-skills/ADR-001-skill-md-convention.md)
