# ADR-005: Prompt-Based Orchestration Constraints

## Status

Proposed

## Context

The developer workflow extension uses SKILL.md files to instruct LLMs — it does not have a runtime DAG engine, process manager, or coordination layer. ADRs 001–004 describe the workflow architecture in precise, structured terms (DAG nodes, gate criteria, retry counts, pruning thresholds), but the execution medium is natural language interpretation by an LLM.

This creates a fundamental tension: the design describes **what should happen**, but the LLM decides **what actually happens**. Some architectural concepts that would be straightforward in code (retry counters, file locks, parallel process spawning) become best-effort instructions in a prompt-based system.

However, the RenreKit extension model provides real executable infrastructure — **CLI commands**, **session hooks**, and **skill folders** — that can enforce constraints the SKILL.md alone cannot. By delegating structural and validation work to commands, the extension moves elements from "advisory" to "command-enforced."

This ADR explicitly classifies design elements into three enforcement tiers, and defines how CLI commands, hooks, and skill folder structure work together to maximize what the prompt-based system can reliably deliver.

## Decision

### Three Enforcement Tiers

Every architectural element from ADRs 001–004 falls into one of three categories:

**Tier 1: Command-Enforced** — CLI commands execute deterministic logic. The SKILL.md instructs the LLM to call these commands; the command handles the rest:

| Element | Command | What It Enforces |
|---------|---------|-----------------|
| Plan directory creation | `workflow:init` | Creates plan directory structure with all subdirectories, initializes PLAN.md with classification template, creates empty progress.md |
| Classification scoring | `workflow:init` | Applies floor rules (ADR-002) deterministically — LLM provides dimension scores, command applies tier mapping and floor overrides |
| Progress tracking | `workflow:progress` | Appends structured entries to progress.md with timestamps, phase, status — prevents malformed or missing entries |
| Validation suite | `workflow:validate` | Runs lint + typecheck + tests + duplication, writes structured validation-report.md, returns pass/fail with retry count |
| Resume detection | `workflow:status` | Reads progress.md, returns last completed phase, next expected phase, and any abort state |
| Memory injection | `workflow:context` | Reads both global and project LEARNINGS.md, returns relevant sections for current phase |
| Retrospective archiving | `workflow:retro` | Archives RETROSPECTIVE.md to correct layer (global/project), updates LEARNINGS.md, handles pruning with actual line counts |
| Git branch management | `workflow:init` | Creates `workflow/{plan-name}` branch; `workflow:commit` creates conventional commits per phase |
| Abort recording | `workflow:abort` | Writes abort section to PLAN.md, updates progress.md status, triggers retrospective generation |

**Tier 2: SKILL.md Enforceable** — the SKILL.md can reliably instruct these because they map to concrete, observable file operations:

| Element | Why Enforceable |
|---------|----------------|
| Output file content (sections, headers) | Agent produces markdown following template — verifiable by structure |
| Agent output file naming | Agent writes to specific paths dictated by SKILL.md — verifiable by path |
| File ownership table in module-breakdown.md | Agent writes a concrete table — verifiable by content |
| Feasibility report format | Agent writes structured markdown — verifiable by sections |
| Merge synthesis document | Agent reads inputs and writes output — verifiable by existence and content |

**Tier 2.5: Hook-Automated** — agent lifecycle hooks (ADR-006) automatically track elements that were previously advisory, without requiring the LLM to explicitly report them:

| Element | Hook | What Gets Tracked Automatically |
|---------|------|-------------------------------|
| Parallel agent count | SubagentStart / SubagentStop | Number of agents spawned and completed per phase |
| Workflow pause on interruption | Stop | `paused` entry written to progress.md even if LLM didn't call `workflow:progress` |
| Context preservation | PreCompact | Checkpoint written before context window compaction |
| Error accumulation | ErrorOccurred | Errors logged to `review/errors.md` without LLM self-reporting |
| Plan file manifest | PostToolUse | Automatic record of plan directory file writes |

**Tier 3: Advisory** — the SKILL.md describes intent, but the LLM may approximate, skip, or misinterpret:

| Element | Why Advisory |
|---------|-------------|
| DAG node ordering | LLM follows described sequence but may reorder or skip steps |
| Merge quality (synthesizing contradictions) | Depends on LLM reasoning capability |
| File ownership compliance | No filesystem lock; LLM may edit files outside its assignment |
| Scoring consistency across sessions | Different sessions may score the same task differently |

**Design principle:** Push as much as possible into Tier 1 (commands). Write Tier 2 instructions with precision (exact paths, exact section headers). Write Tier 3 elements as **guidelines with rationale** — explain *why* the rule exists so the LLM can make reasonable judgment calls even if it doesn't follow exactly.

### Session Hook: Memory Injection at Start

The extension registers a `SessionStart` hook that executes `workflow:context` at the beginning of every LLM session. This command:

1. Checks if there's an active workflow (reads `.renre-kit/plan/*/progress.md` for non-complete status)
2. If active workflow exists → returns the PLAN.md summary, current phase, and relevant memory for that phase
3. If no active workflow → returns project LEARNINGS.md summary (architecture, quirks, testing patterns) as ambient context

This means the LLM **always starts with project knowledge** — it doesn't need to discover LEARNINGS.md on its own. The hook output appears in the session context automatically.

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "renre-kit workflow:context"
      }
    ]
  }
}
```

### Skill Folder Structure with Reference Examples

Each workflow skill directory contains not just the SKILL.md but also **reference examples** and **context files** that the LLM can read during execution:

```
agent/skills/orchestrate/
├── SKILL.md                              # Main orchestration instructions
├── examples/
│   ├── quick-fix-walkthrough.md          # Complete quick-fix example with file contents
│   ├── bug-fix-walkthrough.md            # Complete bug-fix example with parallel research
│   └── complex-task-walkthrough.md       # Complex task with all phases
├── context/
│   ├── classification-rubric.md          # Scoring dimensions with examples per score level
│   ├── plan-directory-reference.md       # Directory structure with file purpose explanations
│   └── output-templates.md              # Templates for all agent output files
```

The examples serve as **few-shot demonstrations** — concrete walkthroughs showing the expected plan directory contents at each phase. This is more effective than abstract instructions because the LLM can pattern-match against real examples.

### Command-Backed Validation Loop

The validation gate node is backed by the `workflow:validate` command, which makes the retry budget enforceable:

```
SKILL.md instructs:
  "Run `renre-kit workflow:validate` to check your implementation.
   The command returns pass/fail with a retry count.
   If it returns retry_count >= 3, stop and ask the user."
```

The command tracks retry count in `review/validation-report.md`:

```markdown
# Validation Report

## Run 1 — {timestamp}
**Status**: FAIL
**Failures**: 2 lint errors in src/features/auth/handler.ts

## Run 2 — {timestamp}
**Status**: FAIL
**Failures**: 1 test failure in auth.test.ts

## Run 3 — {timestamp}
**Status**: FAIL
**Failures**: 1 test failure in auth.test.ts (same)
**Retry limit reached**: true
```

The command returns `{ output: "FAIL (retry 3/3 — limit reached)", exitCode: 1 }`. The SKILL.md says to stop; the command gives it the concrete signal.

### Git Integration Convention

Every workflow creates a traceable git history:

1. **Branch per workflow** — `workflow:init` creates `workflow/{plan-name}` branch from the current branch
2. **Commit per phase** — `workflow:commit --phase {name}` creates conventional commits: `workflow({plan-name}): {phase} complete`
3. **Final squash optional** — user decides whether to squash workflow commits into one before merging

This gives rollback granularity: `git log --oneline workflow/{plan-name}` shows every phase, and `git revert` works at phase level.

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

The `workflow:abort --reason feasibility` command records this outcome and still triggers retrospective generation.

### Host-Dependent Capabilities

The workflow design references capabilities that depend on the LLM host environment:

| Capability | Claude Code | Cursor / Windsurf | Generic LLM |
|-----------|------------|-------------------|-------------|
| Spawn parallel subagents | Yes (Agent tool) | Varies | No |
| Run CLI commands | Yes (Bash tool) | Yes | No |
| Read/write files | Yes | Yes | No |
| Context window size | ~200k tokens | Varies | Varies |
| Session hooks | Yes | Varies | No |

The SKILL.md should be written for the **most capable host** (Claude Code with subagent support) but degrade gracefully:

- If parallel agents aren't available → run phases sequentially (the DAG becomes a linear pipeline)
- If CLI commands aren't available → the SKILL.md includes fallback instructions for manual file operations
- If session hooks don't fire → the SKILL.md includes a "check for active workflow" instruction at the start
- If context is limited → summarize research outputs more aggressively before feeding to planning phase

**SKILL.md instruction:** "If you can spawn subagents, run research agents in parallel. If not, run them sequentially — the file protocol works the same either way. The DAG describes data dependencies, not a requirement for parallelism."

### Mid-Workflow User Interaction

When the orchestrator encounters decisions requiring human judgment, it uses the **host environment's native question tool** rather than a workflow-specific mechanism:

| Host | Tool |
|------|------|
| Claude Code | `AskUserQuestion` |
| Cline | `ask_followup_question` |
| Cursor | Native chat response |
| Generic | Plain text question in output |

**Concrete triggers for asking the user**:
- Research agents produce contradictory findings affecting the implementation approach
- Classification is borderline between tiers and the user's intent is ambiguous
- Validation fails at the retry limit (3x default) — present failures, ask how to proceed
- Feasibility assessment is "needs-more-information" — ask the specific questions
- Implementation requires a design choice not covered by existing patterns

**Do not ask for**: routine phase transitions, file ownership assignments, which tests to run, or minor implementation details within the planned approach.

The SKILL.md instruction:

> "When you encounter a decision that requires user input — contradictory findings, ambiguous requirements, a choice between implementation approaches, or repeated validation failures — ask the user directly using your host's question mechanism. Do not guess. Do not pick arbitrarily. Present the options with context from your research and let the user decide."

See [ADR-007: Developer Experience and Activation](ADR-007-developer-experience-and-activation.md) for the full interaction model.

### What This Design Cannot Guarantee

Explicitly documenting non-guarantees prevents false expectations:

1. **Deterministic classification** — dimension scores are LLM-assigned and may vary across sessions. Floor rules (ADR-002) and the `workflow:init` command ensure tier mapping is deterministic given the same scores, but the scores themselves are advisory.
2. **Perfect file ownership** — during parallel implementation, agents may accidentally edit files outside their assignment. The integration phase exists partly to catch these conflicts.
3. **Consistent merge quality** — synthesizing contradictory research depends on the LLM's reasoning. Reference examples in the skill folder help but can't guarantee quality.
4. **Exact DAG traversal** — the LLM may skip phases or reorder them. Commands like `workflow:progress` create a paper trail of what actually happened vs what was expected.
5. **Session continuity** — if context is exhausted mid-workflow, the resume protocol (`workflow:status`) and session hook (`workflow:context`) reconstruct state, but some nuance from the original session may be lost.

## Consequences

### Positive

- **Command-enforced structure** — plan directory creation, validation, progress tracking, memory management, and git operations are deterministic, not prompt-dependent
- **Session hooks provide ambient context** — every session starts with project knowledge and active workflow state, no explicit LLM action required
- **Few-shot examples in skill folders** — concrete walkthroughs are more reliable than abstract instructions for guiding LLM behavior
- **Graceful degradation** — the workflow works across different host environments, falling back from parallel to sequential execution and from commands to manual file operations
- **Honest classification** — explicitly separating command-enforced from advisory elements prevents overengineering the SKILL.md with precision that can't be delivered
- **Git integration** — provides the rollback capability that a prompt-based system can't otherwise offer

### Negative

- **Command implementation cost** — each command (init, progress, validate, status, context, retro, commit, abort) requires CLI code, tests, and maintenance
- **Coupling to RenreKit CLI** — the commands only work within the RenreKit ecosystem; users of other tools can't benefit from the enforcement tier
- **Host fragmentation** — different LLM hosts provide different capabilities, making it hard to document one consistent user experience
- **Two failure modes** — a command can fail (bug in command code) or the LLM can fail to call the command. Both must be debugged differently

## Alternatives Considered

### Build a Runtime DAG Engine

Implement a Node.js process that manages DAG execution, spawns agents, enforces retries, and validates outputs programmatically. Would solve all advisory-element limitations but adds enormous implementation complexity, requires the CLI to manage long-running processes, and fights against the SKILL.md instruction model where the LLM is the execution engine. Rejected because it contradicts the extension's philosophy of being a prompt-driven workflow, not a workflow engine.

### Pure SKILL.md (No Commands)

Rely entirely on SKILL.md instructions with no CLI command backing. Simpler to implement but loses all Tier 1 enforcement — directory structure, validation retry counting, memory pruning, and git operations all become advisory. Rejected because the extension infrastructure exists specifically to provide this kind of backing.

### Ignore the Constraints

Don't document the limitations — write the SKILL.md as if the LLM will follow every instruction perfectly. Simpler documentation but creates false expectations and makes debugging harder when the LLM doesn't behave as specified. Rejected because transparency about limitations leads to better SKILL.md authoring and more realistic user expectations.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md) — defines the DAG structure this ADR constrains
- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md) — floor rules referenced here
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md) — file ownership rules referenced here
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md) — staleness detection referenced here
- [ADR-006: Extension Manifest and Agent Asset Structure](ADR-006-extension-manifest-and-agent-assets.md) — defines the full manifest, commands, hooks, and skill folder layout
- [ADR-007: Developer Experience and Activation](ADR-007-developer-experience-and-activation.md) — activation threshold, announcement, user interaction, and concurrent workflows
