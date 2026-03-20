# ADR-002: Task Classification and Routing

## Status

Proposed

## Context

The DAG-based workflow orchestration (ADR-001) requires an entry point that analyzes incoming tasks and routes them to the appropriate workflow tier. Misclassification has real consequences: underclassifying a complex task leads to inadequate research and fragile implementations; overclassifying a simple rename wastes time on unnecessary ceremony.

The classification must be deterministic enough to be reliable yet flexible enough to handle the ambiguity inherent in natural language task descriptions. It must also support reclassification — a task initially classified as a quick fix may reveal hidden complexity during the scout phase.

## Decision

Implement a **multi-dimensional scoring classifier** embedded in the orchestrator SKILL.md that evaluates tasks across five dimensions, sums the scores, and maps the total to a workflow tier.

### Classification Dimensions

| Dimension | Score 0 | Score 1 | Score 2 | Score 3 |
|-----------|---------|---------|---------|---------|
| **Files Affected** | 1 file | 2–3 files | 4–8 files | 9+ files |
| **Domain Knowledge** | None needed | Single domain | Cross-domain | External API/protocol |
| **Risk Level** | Cosmetic | Functional (isolated) | Functional (shared) | Data loss / security |
| **Dependency Depth** | No deps | Internal deps only | External deps | Breaking changes |
| **Uncertainty** | Clear solution | Minor unknowns | Research required | Spike / prototype first |

### Tier Mapping

| Total Score | Tier | Workflow |
|-------------|------|----------|
| 0–3 | Quick Fix | `workflow-quick-fix` |
| 4–7 | Bug Fix | `workflow-bug-fix` |
| 8–15 | Complex Task | `workflow-complex` |

### Reclassification Protocol

The orchestrator monitors for **escalation signals** during execution:

- **Scout phase discovers more files** than initially estimated → recalculate score
- **Research reveals external dependencies** not mentioned in the task → bump dependency depth
- **Validation fails repeatedly** → consider escalating to complex tier for deeper analysis

Reclassification triggers:
1. Orchestrator pauses current DAG
2. Re-scores the task with new information
3. If the new tier is higher, migrates existing plan artifacts to the new workflow
4. If the new tier is the same or lower, continues current workflow

### Classification Output

The classifier writes its assessment to `PLAN.md` header:

```markdown
# Plan: {task-name}

## Classification
- **Tier**: Complex Task (score: 9/15)
- **Scores**: Files=2, Domain=2, Risk=2, Deps=1, Uncertainty=2
- **Rationale**: Cross-domain change touching auth and registration with external OAuth dependency
- **Escalated from**: Bug Fix (original score: 6, escalated after research revealed OAuth complexity)
```

## Consequences

### Positive

- **Transparent** — the scoring is visible in the plan, users can understand and override the classification
- **Adaptable** — reclassification prevents commitment to an undersized workflow when complexity is discovered
- **Reproducible** — the five dimensions provide a consistent framework that different LLM sessions will score similarly
- **Lightweight** — classification happens in seconds as part of the orchestrator's initial analysis, no separate tool or command needed

### Negative

- **Scoring is heuristic** — LLMs may score dimensions inconsistently across sessions; the same task could land in different tiers
- **Reclassification disrupts flow** — migrating from one tier to another mid-workflow adds complexity to the orchestrator skill
- **Dimension weights are equal** — a high-risk single-file change (score 3 in risk, 0 in files = total 3) routes to quick fix, which may underweight the risk dimension

## Alternatives Considered

### Binary Classification (Simple vs Complex)

Two tiers only. Simpler routing but loses the middle ground — bug fixes either get too much or too little ceremony. Rejected because the three-tier model better matches real development patterns.

### LLM Free-Form Classification

Let the LLM decide the tier without a scoring rubric. Faster to implement but inconsistent across sessions and difficult to explain or override. Rejected in favor of a structured scoring system that produces auditable results.

### User-Specified Tier

Require the user to explicitly choose quick fix / bug fix / complex. Eliminates misclassification but adds friction and relies on the user's assessment, which may be wrong. Rejected as the default but supported as an override (user can specify tier in the task description).

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md)
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md)
