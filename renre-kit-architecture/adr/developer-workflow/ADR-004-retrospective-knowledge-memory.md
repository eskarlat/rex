# ADR-004: Retrospective Knowledge Memory

## Status

Proposed

## Context

Each completed workflow generates a retrospective document (`RETROSPECTIVE.md`) that captures what went well, what went wrong, and lessons learned. Without a mechanism to carry these learnings forward, each new workflow starts from zero — repeating the same mistakes, missing the same edge cases, and failing to leverage patterns that worked before.

The extension needs a **knowledge memory** system that accumulates insights across workflows and feeds them into future task classification, research, and implementation phases. This creates a positive feedback loop: workflows get better over time as the system learns from its own history.

Two categories of knowledge emerge from retrospectives: **workflow knowledge** (how to run workflows effectively — agent coordination, classification calibration, general development practices) that transfers across any project, and **project knowledge** (codebase patterns, architectural quirks, tech stack specifics) that is meaningful only within a single project.

## Decision

Implement a **two-layer file-based knowledge memory** that separates workflow-level learnings (global) from project-specific knowledge (local). This mirrors RenreKit's existing state model where global state lives in `~/.renre-kit/` and project state lives in `.renre-kit/`.

### Two-Layer Memory Architecture

```
~/.renre-kit/memory/                          # Global — workflow knowledge
├── LEARNINGS.md                              # Workflow-level insights (cross-project)
├── patterns/                                 # Reusable workflow patterns
│   └── {pattern-name}.md
├── pitfalls/                                 # General pitfalls to avoid
│   └── {pitfall-name}.md
└── retrospectives/                           # Archive of all retrospectives (all projects)
    └── {project}--{plan-name}.retro.md

.renre-kit/memory/                            # Project — codebase knowledge
├── LEARNINGS.md                              # Project-specific insights
├── patterns/                                 # Project-specific patterns
│   └── {pattern-name}.md
├── pitfalls/                                 # Project-specific pitfalls
│   └── {pitfall-name}.md
└── retrospectives/                           # Archive of project retrospectives
    └── {plan-name}.retro.md
```

### What Goes Where

| Layer | Location | Content | Examples |
|-------|----------|---------|---------|
| **Global** | `~/.renre-kit/memory/` | Workflow orchestration learnings, classification calibration, agent coordination, general development practices | "Research agents produce better findings with explicit file paths", "OAuth tasks are consistently underclassified — bump Domain Knowledge by 1", "Always flag merge contradictions explicitly" |
| **Project** | `.renre-kit/memory/` | Codebase patterns, architectural knowledge, tech stack specifics, project conventions, known quirks | "This project uses repository pattern for data access", "Auth module has circular deps — always import from the facade", "CSS modules need explicit typing in this project", "ESLint config disallows default exports" |

### Classification Rules for Insight Routing

When the orchestrator extracts insights from a retrospective, it classifies each insight:

1. **Is this about the workflow process itself?** → Global
   - Classification accuracy, agent coordination, phase transitions, merge quality
2. **Is this about a general development technique?** → Global
   - "Check test coverage before planning", "Start changes at lowest abstraction level"
3. **Is this about this specific codebase?** → Project
   - File paths, module patterns, dependency quirks, naming conventions
4. **Is this about this project's tech stack configuration?** → Project
   - ESLint rules, TypeScript strictness, test framework setup, CI/CD specifics
5. **Ambiguous?** → Both (duplicated with appropriate framing)

### Global LEARNINGS.md Structure

```markdown
# Workflow Learnings (Global)

Last updated: {timestamp}
Total workflows completed: {count} (across {N} projects)

## Classification Insights
{Cross-project scoring calibration — e.g., "Tasks involving OAuth are consistently
underclassified; bump Domain Knowledge score by 1 when OAuth is mentioned"}

## Agent Coordination
{Multi-agent orchestration learnings — e.g., "Research agents produce better findings
when given explicit file paths to start from rather than open-ended exploration"}

## Research Patterns
{General research strategies — e.g., "Always check for existing test coverage before
planning implementation; 60% of bug fixes already have partial test coverage"}

## Implementation Patterns
{Universal implementation strategies — e.g., "When modifying shared utilities, implement
the change at the lowest level first and propagate upward through callers"}

## Validation Insights
{Common validation patterns — e.g., "TypeScript strict mode catches most null-safety
issues; prioritize type-level fixes over runtime checks"}
```

### Project LEARNINGS.md Structure

```markdown
# Project Learnings

Last updated: {timestamp}
Total workflows completed: {count}

## Architecture
{Project structure insights — e.g., "Uses repository pattern for all data access;
new features should follow the same pattern in src/features/{name}/repository.ts"}

## Codebase Quirks
{Known issues and workarounds — e.g., "Auth module has circular dependencies;
always import from src/features/auth/facade.ts, never from internal modules"}

## Tech Stack
{Configuration specifics — e.g., "ESLint disallows default exports; all modules
must use named exports. CSS modules require explicit .d.ts typing files"}

## Testing
{Project test patterns — e.g., "Integration tests require RENRE_KIT_HOME to be set
to a temp directory; see tests/*.test.mjs for the pattern"}

## Common Pitfalls
{Project-specific traps — e.g., "The shared/ directory has noUncheckedIndexedAccess
enabled; always handle potential undefined from array/object indexing"}
```

### Memory Lifecycle

1. **Workflow completes** → orchestrator generates `RETROSPECTIVE.md` in plan directory
2. **Insights classified** → each insight is tagged as global or project-specific
3. **Global insights** → archived to `~/.renre-kit/memory/retrospectives/{project}--{plan}.retro.md`, merged into global `LEARNINGS.md`
4. **Project insights** → archived to `.renre-kit/memory/retrospectives/{plan}.retro.md`, merged into project `LEARNINGS.md`
5. **Patterns/pitfalls** → routed to the appropriate layer's `patterns/` or `pitfalls/` directory

### Memory Consumption

Future workflows consume **both layers** at specific DAG phases:

| Phase | Global Memory Input | Project Memory Input |
|-------|--------------------|--------------------|
| **Classification** | Classification Insights (scoring calibration) | — |
| **Research** | Research Patterns, Agent Coordination | Architecture, Codebase Quirks |
| **Planning** | Implementation Patterns | Architecture, Tech Stack |
| **Implementation** | — | Codebase Quirks, Common Pitfalls, Testing |
| **Validation** | Validation Insights | Tech Stack, Testing |
| **Retrospective** | Previous global retrospectives | Previous project retrospectives |

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

### Global (Workflow)
{Insights about the workflow process, agent coordination, classification}

### Project (Codebase)
{Insights about this specific codebase, patterns discovered, quirks identified}

## Patterns Discovered
{Reusable approaches — tagged [global] or [project]}

## Pitfalls Encountered
{Traps to avoid — tagged [global] or [project]}

## Metrics
- Research agents spawned: {N}
- Implementation agents spawned: {N}
- Validation runs: {N}
- Gap analysis iterations: {N}
- Files modified: {N}
- Tests added/modified: {N}
```

### Memory Pruning

To prevent unbounded growth, each layer is pruned independently:

**Global (`~/.renre-kit/memory/`):**
- `LEARNINGS.md` capped at ~500 lines; consolidate overlapping insights when exceeded
- `retrospectives/` retains the last 100 retrospectives (across all projects); older ones summarized then removed
- `patterns/` and `pitfalls/` reviewed every 20 workflows; outdated entries removed

**Project (`.renre-kit/memory/`):**
- `LEARNINGS.md` capped at ~300 lines; consolidate when exceeded
- `retrospectives/` retains the last 30 retrospectives; older ones summarized then removed
- `patterns/` and `pitfalls/` reviewed every 10 workflows; outdated or contradicted entries removed

### Git Considerations

- **Project memory** (`.renre-kit/memory/`) — should be committed to the repo so team members share codebase knowledge
- **Global memory** (`~/.renre-kit/memory/`) — lives outside the repo; personal to the developer's machine

## Consequences

### Positive

- **Right knowledge in the right place** — workflow orchestration learnings benefit all projects; codebase knowledge stays where it's relevant
- **Cross-project improvement** — global memory means a developer's 50th project benefits from all 49 previous projects' workflow learnings
- **Team knowledge sharing** — project memory committed to git means the whole team benefits from codebase insights, not just the developer who discovered them
- **Consistent with RenreKit model** — follows the established global (`~/.renre-kit/`) vs project (`.renre-kit/`) state split
- **Self-correcting classification** — global scoring calibration improves across projects over time
- **Transparent** — all memory is plain markdown files that developers can read, edit, or override at either layer

### Negative

- **Classification ambiguity** — some insights straddle the boundary between global and project; the LLM must make judgment calls about routing
- **Dual-layer complexity** — the orchestrator must read from and write to two locations instead of one, increasing the SKILL.md instruction complexity
- **Global memory grows with projects** — a developer working across many diverse projects may accumulate contradictory global insights (e.g., "always use strict mode" vs insights from a legacy JS project)
- **Cold start at both layers** — new developers have empty global memory; new projects have empty project memory. Both require 5–10 workflows to become valuable
- **Storage across two locations** — debugging memory issues requires checking both `~/.renre-kit/memory/` and `.renre-kit/memory/`

## Alternatives Considered

### Project-Only Memory

Store all learnings in `.renre-kit/memory/` per-project. Simpler implementation but loses workflow orchestration learnings when starting new projects. A developer who has mastered agent coordination on one project starts from scratch on the next. Rejected because workflow knowledge is genuinely transferable.

### Global-Only Memory

Store all learnings in `~/.renre-kit/memory/` globally. Simpler implementation but mixes project-specific codebase quirks with general workflow insights. A TypeScript project's strict mode learnings pollute context for a Python project. Rejected because codebase knowledge is inherently project-scoped.

### Database-Backed Memory

Store learnings in SQLite alongside RenreKit's existing database. More structured and queryable but harder for developers to read and edit manually. The file-based approach aligns with the plan directory convention and keeps all workflow artifacts in one inspectable format. Rejected.

### No Memory (Stateless Workflows)

Each workflow starts fresh with no historical context. Simplest implementation but wastes accumulated knowledge and repeats known mistakes. Rejected because the learning loop is a core differentiator of this extension.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md)
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md)
- [ADR-001: SKILL.md Convention](../llm-skills/ADR-001-skill-md-convention.md)
