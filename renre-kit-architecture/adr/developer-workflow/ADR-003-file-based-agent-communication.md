# ADR-003: File-Based Agent Communication Protocol

## Status

Proposed

## Context

The DAG-based workflow orchestration (ADR-001) requires multiple AI agents to work in parallel and share findings. When three research agents explore different aspects of a codebase simultaneously, their discoveries must be collected, synthesized, and fed into the planning phase. Similarly, when multiple implementers work on separate modules, their outputs must be integrated.

The communication mechanism must be: inspectable by humans (developers should see what agents found), persistent across sessions (workflows may be interrupted and resumed), compatible with the SKILL.md instruction model (agents are guided by natural language, not code APIs), and simple enough that LLMs can reliably follow the protocol.

## Decision

Adopt a **file-based communication protocol** where agents read from and write to a shared plan directory at `.renre-kit/plan/{plan-name}/`. Each agent writes its outputs to a designated file path, and downstream agents read from those paths.

### Plan Directory Structure

```
.renre-kit/plan/{plan-name}/
├── PLAN.md                          # Main plan document (owned by orchestrator)
├── research/                        # Phase 1: Research outputs
│   ├── domain-research.md           # Agent: Researcher
│   ├── codebase-analysis.md         # Agent: Scout
│   ├── dependency-analysis.md       # Agent: Scout (deps focus)
│   ├── architecture-constraints.md  # Agent: Architect
│   └── merged-findings.md           # Agent: Orchestrator (synthesis)
├── implementation/                  # Phase 2: Implementation tracking
│   ├── module-breakdown.md          # Agent: Architect (decomposition)
│   ├── progress.md                  # Agent: Orchestrator (status tracker)
│   ├── module-{name}.md             # Agent: Implementer (per-module notes)
│   └── integration-notes.md         # Agent: Implementer (cross-module)
├── review/                          # Phase 3: Validation outputs
│   ├── gap-analysis.md              # Agent: Reviewer
│   └── validation-report.md         # Agent: Reviewer
└── RETROSPECTIVE.md                 # Agent: Orchestrator (auto-generated)
```

### Communication Rules

1. **Write isolation** — each agent writes only to its designated files; no agent overwrites another agent's output
2. **Read freedom** — any agent can read any file in the plan directory to inform its work
3. **Orchestrator as hub** — the orchestrator reads all outputs at merge points and writes synthesis documents (e.g., `merged-findings.md`)
4. **Append-only progress** — `progress.md` is append-only; agents add entries but never remove or edit previous entries
5. **Structured sections** — each output file follows a consistent markdown structure with `## Summary`, `## Findings`, `## Recommendations`, and `## Open Questions`

### File Naming Convention

| Agent Role | Research Phase | Implementation Phase | Review Phase |
|------------|---------------|---------------------|--------------|
| Scout | `codebase-analysis.md` | — | — |
| Researcher | `domain-research.md` | — | — |
| Architect | `architecture-constraints.md` | `module-breakdown.md` | — |
| Implementer | — | `module-{name}.md` | — |
| Reviewer | — | — | `gap-analysis.md`, `validation-report.md` |
| Orchestrator | `merged-findings.md` | `progress.md` | `RETROSPECTIVE.md` |

### Output File Template

Every agent output file follows this structure:

```markdown
# {Title}

**Agent**: {role}
**Phase**: {research|implementation|review}
**Timestamp**: {ISO 8601}
**Status**: {in-progress|complete}

## Summary
{1-3 sentence overview of findings}

## Findings
{Detailed findings, organized by topic}

## Recommendations
{Actionable next steps based on findings}

## Open Questions
{Unresolved items that need attention from other agents or the user}
```

### Merge Protocol

At each merge point in the DAG, the orchestrator:
1. Reads all parallel agent outputs from the current phase directory
2. Identifies agreements, contradictions, and gaps across agent findings
3. Writes a `merged-findings.md` that synthesizes into a coherent narrative
4. Flags unresolved contradictions as items requiring user input
5. Feeds the merged document as context to the next DAG phase

## Consequences

### Positive

- **Human-inspectable** — developers can read agent research at any time, understand the reasoning, and intervene if needed
- **Session-persistent** — workflows survive interruptions; any agent (or a new session) can resume by reading the plan directory
- **Git-friendly** — plan files are plain markdown that can be committed, diffed, and reviewed alongside code changes
- **Debuggable** — when a workflow produces poor results, the full chain of agent reasoning is available for diagnosis
- **No infrastructure** — no message queues, databases, or shared memory; just the filesystem that every agent can already access

### Negative

- **No real-time streaming** — agents cannot observe each other's work in progress; they only see completed outputs at merge points
- **File proliferation** — complex tasks with many modules can generate 15+ files in the plan directory
- **Merge quality depends on LLM** — the orchestrator's ability to synthesize contradictory findings is limited by the LLM's reasoning capability
- **No locking** — if two agents somehow write to the same file (violating the protocol), data could be lost; this is mitigated by write isolation rules in the SKILL.md instructions

## Alternatives Considered

### In-Memory Message Passing

Agents communicate through a shared context window or message bus. Faster but not persistent across sessions, not human-inspectable, and not compatible with the SKILL.md instruction model where each agent operates independently. Rejected.

### Database-Backed Communication

Store agent outputs in SQLite tables alongside existing RenreKit data. Structured and queryable but adds coupling to the CLI core, makes plan data harder to inspect manually, and doesn't benefit from git versioning. Rejected.

### Single Plan File

All agents write to a single `PLAN.md` file with clearly delimited sections. Simpler but creates write contention when agents work in parallel and makes individual agent outputs harder to isolate for debugging. Rejected.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md)
- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md)
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md)
