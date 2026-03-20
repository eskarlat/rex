# ADR-004: Retrospective Knowledge Memory

## Status

Proposed

## Context

Each completed workflow generates a retrospective document (`RETROSPECTIVE.md`) that captures what went well, what went wrong, and lessons learned. Without a mechanism to carry these learnings forward, each new workflow starts from zero — repeating the same mistakes, missing the same edge cases, and failing to leverage patterns that worked before.

The extension needs a **knowledge memory** system that accumulates insights across workflows and feeds them into future task classification, research, and implementation phases. This creates a positive feedback loop: workflows get better over time as the system learns from its own history.

## Decision

Implement a **file-based knowledge memory** stored at `.renre-kit/memory/` (project-level) that aggregates retrospective insights and makes them available to future workflow runs.

### Memory Architecture

```
.renre-kit/memory/
├── LEARNINGS.md              # Aggregated lessons (primary memory file)
├── patterns/                 # Reusable patterns discovered across workflows
│   ├── {pattern-name}.md     # Individual pattern document
│   └── ...
├── pitfalls/                 # Known pitfalls to avoid
│   ├── {pitfall-name}.md     # Individual pitfall document
│   └── ...
└── retrospectives/           # Archive of all workflow retrospectives
    ├── {plan-name}.retro.md  # Copied from plan directory on completion
    └── ...
```

### LEARNINGS.md Structure

The primary memory file is a curated, evolving document:

```markdown
# Workflow Learnings

Last updated: {timestamp}
Total workflows completed: {count}

## Classification Insights
{Lessons about task classification accuracy — e.g., "Tasks involving OAuth are
consistently underclassified; bump Domain Knowledge score by 1 when OAuth is mentioned"}

## Research Patterns
{What research approaches work well — e.g., "Always check for existing test coverage
before planning implementation; 60% of bug fixes already have partial test coverage"}

## Implementation Patterns
{Effective implementation strategies — e.g., "When modifying shared utilities, implement
the change at the lowest level first and propagate upward through callers"}

## Validation Insights
{Common validation failures and prevention — e.g., "TypeScript strict mode catches
most null-safety issues; prioritize type-level fixes over runtime checks"}

## Team Coordination
{Multi-agent coordination learnings — e.g., "Research agents produce better findings
when given explicit file paths to start from rather than open-ended exploration"}
```

### Memory Lifecycle

1. **Workflow completes** → orchestrator generates `RETROSPECTIVE.md` in plan directory
2. **Retrospective archived** → copied to `.renre-kit/memory/retrospectives/{plan-name}.retro.md`
3. **Learnings extracted** → orchestrator analyzes the retrospective and extracts actionable insights
4. **LEARNINGS.md updated** → new insights merged into the appropriate section, duplicates consolidated
5. **Patterns/pitfalls created** → significant recurring patterns or pitfalls get their own documents

### Memory Consumption

Future workflows consume memory at specific DAG phases:

| Phase | Memory Input | Purpose |
|-------|-------------|---------|
| **Classification** | Classification Insights section | Correct known scoring biases |
| **Research** | Research Patterns + relevant pitfalls | Focus research on proven approaches, avoid known dead ends |
| **Planning** | Implementation Patterns | Inform architecture decisions with historical context |
| **Validation** | Validation Insights | Pre-emptively address common failure patterns |
| **Retrospective** | Previous retrospectives for similar tasks | Compare outcomes over time |

### RETROSPECTIVE.md Template

Auto-generated at workflow completion:

```markdown
# Retrospective: {plan-name}

**Tier**: {quick-fix|bug-fix|complex}
**Duration**: {start} → {end}
**Classification Score**: {score}/15
**Reclassified**: {yes/no, from what tier}

## What Went Well
{Phases that executed smoothly, accurate estimates, effective research}

## What Went Wrong
{Misclassifications, failed validations, wasted research, integration issues}

## Lessons Learned
{Specific, actionable insights to carry forward}

## Patterns Discovered
{Reusable approaches that worked for this type of task}

## Pitfalls Encountered
{Traps to avoid in similar future tasks}

## Metrics
- Research agents spawned: {N}
- Implementation agents spawned: {N}
- Validation runs: {N}
- Gap analysis iterations: {N}
- Files modified: {N}
- Tests added/modified: {N}
```

### Memory Pruning

To prevent unbounded growth:
- `LEARNINGS.md` is capped at ~500 lines; when exceeded, the orchestrator consolidates overlapping insights
- `retrospectives/` archive retains the last 50 retrospectives; older ones are summarized into LEARNINGS.md then removed
- `patterns/` and `pitfalls/` are reviewed every 10 workflows; outdated or contradicted entries are removed

### Scope: Project-Level Memory

Memory is stored per-project in `.renre-kit/memory/`. This is intentional:
- Different projects have different patterns, dependencies, and conventions
- Cross-project memory would mix unrelated learnings and reduce signal-to-noise
- Users who want shared learnings across projects can symlink or copy the memory directory

## Consequences

### Positive

- **Continuous improvement** — each workflow benefits from all previous workflows' lessons, creating compound value over time
- **Reduced repetition** — known pitfalls are surfaced proactively, preventing the same mistakes from recurring
- **Institutional knowledge** — team-level insights persist even when individual developers rotate; the project's memory outlasts any single session
- **Transparent** — all memory is plain markdown files that developers can read, edit, or override
- **Self-correcting classification** — scoring biases identified in retrospectives feed back into the classifier, improving accuracy over time

### Negative

- **Memory quality depends on LLM** — the retrospective and learning extraction are only as good as the LLM's ability to identify meaningful patterns
- **Stale learnings** — insights from early workflows may become irrelevant as the codebase evolves; pruning mitigates but doesn't eliminate this
- **Storage growth** — 50 retrospectives plus patterns and pitfalls could reach several hundred KB per project
- **Cold start** — the first few workflows have no memory to draw from; the system only becomes valuable after 5–10 completed workflows

## Alternatives Considered

### Database-Backed Memory

Store learnings in SQLite alongside RenreKit's existing database. More structured and queryable but harder for developers to read and edit manually. The file-based approach aligns with the plan directory convention and keeps all workflow artifacts in one inspectable format. Rejected.

### Global Memory (Cross-Project)

Store memory in `~/.renre-kit/memory/` shared across all projects. Broader knowledge base but mixes project-specific patterns, reducing relevance. A project's TypeScript strict mode learnings aren't useful for a Python project. Rejected as default, but supported via manual symlinks.

### No Memory (Stateless Workflows)

Each workflow starts fresh with no historical context. Simplest implementation but wastes accumulated knowledge and repeats known mistakes. Rejected because the learning loop is a core differentiator of this extension.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md)
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md)
- [ADR-001: SKILL.md Convention](../llm-skills/ADR-001-skill-md-convention.md)
