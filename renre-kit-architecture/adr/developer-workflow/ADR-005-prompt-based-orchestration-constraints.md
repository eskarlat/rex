# ADR-005: Prompt-Based Orchestration Constraints

## Status

Proposed

## Context

The developer workflow extension uses SKILL.md files to instruct LLMs — it does not have a runtime DAG engine, process manager, or coordination layer. ADRs 001–004 describe the workflow architecture in precise, structured terms (DAG nodes, gate criteria, retry counts, pruning thresholds), but the execution medium is natural language interpretation by an LLM.

This creates a fundamental tension: the design describes **what should happen**, but the LLM decides **what actually happens**. Some architectural concepts that would be straightforward in code (retry counters, file locks, parallel process spawning) become best-effort instructions in a prompt-based system.

This ADR explicitly acknowledges the boundaries of prompt-based orchestration, identifies which design elements are enforceable vs advisory, and introduces additional conventions that work well within these constraints.

## Decision

### Enforceable vs Advisory Design Elements

Classify every architectural element from ADRs 001–004 into two categories:

**Enforceable** — the SKILL.md can reliably instruct these because they map to concrete, observable file operations:

| Element | Why Enforceable |
|---------|----------------|
| Plan directory structure | Agent creates directories and files — verifiable by existence |
| File naming conventions | Agent writes to specific paths — verifiable by path |
| Output file template (sections, headers) | Agent produces markdown — verifiable by structure |
| Classification output in PLAN.md | Agent writes a specific section — verifiable by content |
| Retrospective generation | Agent writes RETROSPECTIVE.md — verifiable by existence |
| Progress tracking (append-only) | Agent appends to progress.md — verifiable by content |
| Git branch per workflow | Agent runs git commands — verifiable by branch existence |

**Advisory** — the SKILL.md describes intent, but the LLM may approximate, skip, or misinterpret:

| Element | Why Advisory |
|---------|-------------|
| Exact retry count (max 3) | No counter; LLM judges "I've tried enough" |
| Parallel agent spawning | Depends on host capabilities (Claude Code subagents, Cursor agents, etc.) |
| DAG node ordering | LLM follows described sequence but may reorder or skip steps |
| Merge quality (synthesizing contradictions) | Depends on LLM reasoning capability |
| File ownership enforcement | No filesystem lock; LLM may edit files outside its assignment |
| Scoring consistency across sessions | Different sessions may score the same task differently |
| Staleness detection for learnings | LLM must actively verify file references; may skip this |
| Pruning thresholds (500 lines, 100 retros) | LLM must count and compare; may approximate |

**Design principle:** Write SKILL.md instructions for the enforceable elements with precision (exact paths, exact section headers). Write advisory elements as **guidelines with rationale** — explain *why* the limit exists so the LLM can make reasonable judgment calls even if it doesn't follow the rule exactly.

### Git Integration Convention

Every workflow creates a traceable git history:

1. **Branch per workflow** — `workflow/{plan-name}` branch created at workflow start from the current branch
2. **Commit per phase** — each major phase (research complete, implementation complete, validation pass) produces a commit with a conventional message: `workflow({plan-name}): {phase} complete`
3. **Final squash optional** — user decides whether to squash workflow commits into one before merging

This gives rollback granularity: `git log --oneline workflow/{plan-name}` shows every phase, and `git revert` works at phase level.

**SKILL.md instruction:** "Before making any code changes, create a git branch named `workflow/{plan-name}`. Commit after each phase with the message format `workflow({plan-name}): {phase} complete`. This enables the user to review or revert individual phases."

### Exploration / Spike Outcome

Not every workflow must produce code. When the classification scores Uncertainty = 3 ("Spike / prototype first"), the workflow may conclude with a **feasibility report** instead of an implementation:

**Research-only termination** — after the research and merge phases, the orchestrator evaluates whether the task is ready for implementation:

- If research resolves the unknowns → proceed to planning and implementation as normal
- If research reveals the task is infeasible or needs more information → terminate with a feasibility report

**Feasibility report** — written to `PLAN.md` as a terminal section:

```markdown
## Feasibility Assessment

**Verdict**: {feasible | infeasible | needs-more-information}
**Confidence**: {high | medium | low}

### Findings
{What the research phase discovered}

### Blockers
{What prevents implementation, if anything}

### Recommended Next Steps
{What the user should do — e.g., "clarify requirements for X", "evaluate alternative Y", "proceed with implementation using approach Z"}
```

The workflow still generates a retrospective — spike outcomes are valuable learnings.

### Host-Dependent Capabilities

The workflow design references capabilities that depend on the LLM host environment:

| Capability | Claude Code | Cursor / Windsurf | Generic LLM |
|-----------|------------|-------------------|-------------|
| Spawn parallel subagents | Yes (Agent tool) | Varies | No |
| Run shell commands (git, lint, test) | Yes (Bash tool) | Yes | No |
| Read/write files | Yes | Yes | No |
| Context window size | ~200k tokens | Varies | Varies |
| Session persistence | Within session | Within session | No |

The SKILL.md should be written for the **most capable host** (Claude Code with subagent support) but degrade gracefully:

- If parallel agents aren't available → run phases sequentially (the DAG becomes a linear pipeline)
- If shell commands aren't available → skip automated validation, ask the user to run it manually
- If context is limited → summarize research outputs more aggressively before feeding to planning phase

**SKILL.md instruction:** "If you can spawn subagents, run research agents in parallel. If not, run them sequentially — the file protocol works the same either way. The DAG describes data dependencies, not a requirement for parallelism."

### What This Design Cannot Guarantee

Explicitly documenting non-guarantees prevents false expectations:

1. **Deterministic classification** — the same task description may score differently across sessions. Floor rules (ADR-002) reduce the impact, but exact scores will vary.
2. **Exact retry counts** — "max 3 retries" is guidance. The LLM may retry 2 or 4 times. The intent (don't loop forever, escalate to the user) matters more than the exact number.
3. **Perfect file ownership** — during parallel implementation, agents may accidentally edit files outside their assignment. The integration phase exists partly to catch these conflicts.
4. **Consistent merge quality** — synthesizing contradictory research depends on the LLM's reasoning. Some merges will be better than others.
5. **Reliable pruning** — the LLM may not count lines or retrospective files accurately. Pruning will be approximate. This is acceptable — the goal is bounded growth, not precise limits.

## Consequences

### Positive

- **Honest design** — explicitly separating enforceable from advisory elements prevents overengineering the SKILL.md with precision that can't be delivered
- **Graceful degradation** — the workflow works across different host environments, falling back from parallel to sequential execution
- **Git integration** — provides the rollback capability that a prompt-based system can't otherwise offer
- **Spike support** — tasks with high uncertainty can terminate with knowledge instead of being forced into premature implementation
- **Reduced false expectations** — documenting non-guarantees sets appropriate expectations for workflow behavior

### Negative

- **Weaker guarantees** — acknowledging that elements are advisory means accepting inconsistency. A runtime engine would enforce rules the LLM can only approximate
- **Host fragmentation** — different LLM hosts provide different capabilities, making it hard to document one consistent user experience
- **Git overhead** — branch-per-workflow adds git operations to every workflow; quick fixes may feel over-ceremonied with a dedicated branch

## Alternatives Considered

### Build a Runtime DAG Engine

Implement a Node.js process that manages DAG execution, spawns agents, enforces retries, and validates outputs programmatically. Would solve all advisory-element limitations but adds enormous implementation complexity, requires the CLI to manage long-running processes, and fights against the SKILL.md instruction model where the LLM is the execution engine. Rejected because it contradicts the extension's philosophy of being a prompt-driven workflow, not a workflow engine.

### Ignore the Constraints

Don't document the limitations — write the SKILL.md as if the LLM will follow every instruction perfectly. Simpler documentation but creates false expectations and makes debugging harder when the LLM doesn't behave as specified. Rejected because transparency about limitations leads to better SKILL.md authoring and more realistic user expectations.

### Dual Mode (Prompt + Engine)

Offer both a prompt-based SKILL.md mode and a CLI-managed engine mode. Users could choose. Doubles the implementation and maintenance surface for marginal benefit — the prompt-based approach is sufficient for the target use case. Rejected as premature optimization.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md) — defines the DAG structure this ADR constrains
- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md) — floor rules referenced here
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md) — file ownership rules referenced here
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md) — staleness detection referenced here
