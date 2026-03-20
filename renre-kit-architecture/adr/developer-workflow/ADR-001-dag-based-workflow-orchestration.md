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

Since the DAG is prompt-driven (no runtime engine), failure handling is expressed as **SKILL.md instructions** that guide the orchestrator's behavior. These are best-effort conventions, not enforced constraints.

**Abort conditions** — the orchestrator should stop the workflow and report to the user when:

- Research phase concludes that the task is **infeasible** (e.g., required API doesn't exist, architectural constraint prevents the change)
- Validation fails **3 consecutive times** on the same issue (suggests the approach is fundamentally wrong, not a fixable error)
- The user explicitly requests cancellation

**On abort**, the orchestrator:

1. Updates `PLAN.md` with an `## Aborted` section explaining the reason
2. Writes `implementation/progress.md` with status `aborted` and last completed phase
3. Still generates `RETROSPECTIVE.md` — aborted workflows produce valuable learnings
4. Reports the abort reason and any partial findings to the user

**Validation retry budget** — gate nodes (validation, gap analysis) should retry at most **3 times** before escalating to the user. The SKILL.md instructs: "If validation fails 3 times on the same category of error, stop and ask the user whether to continue, change approach, or abort."

### Resume Protocol

Workflows may be interrupted (session timeout, user closes terminal, context window exhaustion). The plan directory enables resume:

1. Orchestrator reads `implementation/progress.md` to find the last entry with status `complete`
2. Identifies the corresponding DAG node
3. Reads all existing output files in the plan directory to reconstruct context
4. Resumes from the **next node** after the last completed one
5. Updates `PLAN.md` with a `## Resumed` entry noting the interruption point

**Limitation:** Resume quality depends on how well the new LLM session can reconstruct intent from the plan files. The SKILL.md instructs the orchestrator to write progress entries with enough context for a fresh session to understand the state.

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
- **No runtime DAG engine** — the DAG is encoded in SKILL.md instructions rather than a formal execution engine, meaning the LLM must interpret and follow the graph faithfully

## Alternatives Considered

### Linear Pipeline

Sequential phases only (classify → research → plan → implement → validate). Simpler to implement but loses parallelism benefits. A complex task with 4 research directions would take 4x longer. Rejected because the primary value proposition is concurrent multi-agent work.

### Hybrid (DAG for complex only)

Use linear pipelines for quick fix and bug fix, DAG only for complex tasks. This reduces overhead for simple tasks but introduces two different orchestration models, increasing cognitive load for skill authors and making the orchestrator routing logic more complex. Rejected in favor of a single uniform model where simpler tiers are degenerate cases of the full DAG.

## Related Decisions

- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md)
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md)
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md)
- [ADR-001: SKILL.md Convention](../llm-skills/ADR-001-skill-md-convention.md)
