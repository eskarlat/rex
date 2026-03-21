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

### Dimension Floor Rules

Because all dimensions are weighted equally, a single high-scoring dimension can be masked by low scores elsewhere. To prevent dangerous underclassification, the following **floor rules** override the sum-based tier mapping:

| Condition | Minimum Tier | Rationale |
|-----------|-------------|-----------|
| Any single dimension ≥ 3 | Bug Fix | A score-3 in any dimension signals non-trivial complexity that quick-fix ceremony cannot safely address |
| Risk Level ≥ 2 **and** Uncertainty ≥ 2 | Complex Task | High risk combined with unknowns demands full research phase |
| Dependency Depth = 3 (breaking changes) | Complex Task | Breaking changes require architecture review regardless of other dimensions |

Floor rules are evaluated **after** summing scores. If the floor pushes the tier higher than the sum suggests, the classification output records both: `Tier: Bug Fix (score: 3/15, floor rule: Risk ≥ 3)`.

### Activation Threshold: Score 0 Skips the Workflow

When all five dimensions score 0 (total score = 0), the task is **trivially simple** — obvious fix, single file, no risk, no dependencies, no uncertainty. In this case, the workflow is **not activated at all**. The LLM makes the change directly without calling `workflow:init`, creating a plan directory, or starting a git branch.

This threshold is a bright line: the moment *any* dimension scores 1 or higher, the workflow activates. Even a Quick Fix (score 1–3) benefits from tracked validation and a lightweight retrospective.

**What score-0 tasks lose**: No plan directory, no git branch isolation, no retrospective, no learnings capture. This is acceptable because score-0 tasks have no lessons worth capturing — the fix was already obvious and contained.

See [ADR-007: Developer Experience and Activation](ADR-007-developer-experience-and-activation.md) for the full activation flow.

### User Override

The user may specify a tier explicitly in the task description (e.g., "treat this as a complex task"). User-specified tiers **always** take precedence over both the score and floor rules. The classification output records: `Tier: Complex Task (user-specified, calculated score: 4/15)`.

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
- **Dimension weights are equal** — mitigated by floor rules (see above) but the scoring remains a heuristic; edge cases may still land in unexpected tiers

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
- [ADR-007: Developer Experience and Activation](ADR-007-developer-experience-and-activation.md) — activation threshold and announcement rules
