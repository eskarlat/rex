# ADR-007: Developer Experience and Activation Rules

## Status

Proposed

## Context

ADRs 001–006 define the workflow system's internal architecture — DAGs, classification, file protocols, memory, enforcement tiers, and extension packaging. What they don't define is the **developer-facing experience**: when does the workflow activate, how does it communicate its presence, how does the LLM interact with the user mid-workflow, and can multiple workflows coexist?

These UX decisions shape everything downstream. An always-on workflow that silently orchestrates is a different product from one the user explicitly invokes. The wrong activation threshold either adds friction to trivial tasks or fails to engage on risky ones.

## Decision

### 1. Activation Threshold: Trivial Tasks Skip the Workflow

The workflow is **LLM-decided** based on the classification score. The orchestrate SKILL.md instructs the LLM to mentally score the task before deciding whether to engage the workflow:

- **Score 0** (all dimensions at zero) → **skip the workflow entirely**. Just do the work. No `workflow:init`, no plan directory, no git branch, no retrospective.
- **Score 1–3** → **Quick Fix tier**. Lightweight workflow with minimal ceremony.
- **Score 4+** → **Bug Fix or Complex tier**. Full workflow engagement.

The SKILL.md activation instruction:

> "Before starting any code change, evaluate the task against the five classification dimensions. If all dimensions score 0 — the fix is obvious, contained to a single file, has no risk, no dependencies, and no uncertainty — skip the workflow and make the change directly. For any score of 1 or above, initialize a workflow."

**Rationale**: Score 0 means every dimension signals "trivial." The moment *any* dimension is non-zero, the workflow adds value — even a 1-point score on Risk means validation is worth running through the tracked pipeline. The cost of the workflow for score-0 tasks (plan directory, git branch, retrospective for a typo fix) outweighs the benefit.

**What score-0 tasks lose**: No retrospective, no learnings capture, no git branch isolation. This is acceptable because score-0 tasks by definition have no lessons worth capturing — the fix is already obvious and contained.

### 2. Workflow Announcement: Tell the User

When the workflow activates, the LLM **announces it explicitly** before proceeding:

> "This looks like a **Bug Fix** (score: 6/15 — Files=1, Domain=1, Risk=2, Deps=1, Uncertainty=1). I'll run parallel research before implementing."

The announcement includes:
- **Tier name** — so the user knows what level of ceremony to expect
- **Score breakdown** — so the user can override if the classification feels wrong
- **What happens next** — one sentence about the workflow shape (e.g., "parallel research" vs "straight to implementation")

For score-0 skips, no announcement is needed — the LLM just does the work, which is what the user expects.

**When reclassification occurs**, the LLM also announces:

> "This is more complex than initially classified — research revealed external OAuth dependencies. Escalating from Bug Fix to **Complex Task** (new score: 10/15)."

**Rationale**: Transparency builds trust. The user should never wonder "why is the LLM creating files in `.renre-kit/plan/`?" or "why is it spawning 4 subagents for a bug fix?" The announcement makes the workflow legible. It also gives the user a natural moment to override: "No, just treat this as a quick fix."

### 3. Mid-Workflow User Interaction: Use the Host's Ask Tool

When the orchestrator needs user input during workflow execution — contradictory research findings, ambiguous requirements, validation failures that need human judgment — it uses the **host environment's native question tool**:

| Host | Tool |
|------|------|
| Claude Code | `AskUserQuestion` |
| Cline | `ask_followup_question` |
| Cursor | Native chat response |
| Generic | Plain text question in output |

The SKILL.md instruction:

> "When you encounter a decision that requires user input — contradictory findings, ambiguous requirements, a choice between implementation approaches, or repeated validation failures — ask the user directly using your host's question mechanism. Do not guess. Do not pick arbitrarily. Present the options with context from your research and let the user decide."

**When to ask** (concrete triggers):
- Research agents produce contradictory findings that affect the implementation approach
- Classification is borderline between tiers and the user's intent is ambiguous
- Validation fails at the retry limit (3x) — present the failures and ask how to proceed
- The feasibility assessment is "needs-more-information" — ask the specific questions
- Implementation requires a design choice not covered by existing patterns (e.g., new state management approach)

**When NOT to ask**:
- Routine phase transitions — just proceed
- File ownership assignments — follow the ownership protocol
- Which tests to run — run them all
- Minor implementation details within the planned approach

**Rationale**: The workflow should feel like a capable colleague, not a bureaucratic process. Asking at the right moments (high-stakes decisions, genuine ambiguity) adds value. Asking at every step creates friction. The host's native tool is the right mechanism because it integrates with the user's existing interaction model — they don't need to learn a workflow-specific way to answer questions.

### 4. Concurrent Workflows: Independent and Isolated

Multiple workflows can be active simultaneously. Each workflow is fully independent:

- **Separate plan directories**: `.renre-kit/plan/fix-auth-bug/` and `.renre-kit/plan/add-oauth-support/` coexist
- **Separate git branches**: `workflow/fix-auth-bug` and `workflow/add-oauth-support`
- **Separate progress tracking**: Each has its own `progress.md`
- **No shared state**: Workflows do not read each other's plan files

**The `--plan` flag**: Commands that operate on a specific workflow accept an optional `--plan` flag to target a non-active workflow:

```bash
renre-kit workflow:status                        # Shows all workflows
renre-kit workflow:status --plan fix-auth-bug     # Shows specific workflow
renre-kit workflow:validate --plan add-oauth       # Validates specific workflow
```

**Active workflow resolution**: When a command is called without `--plan`, it operates on the **most recently active** workflow (the one with the latest `in-progress` entry in `progress.md`). If no workflow is active, the command returns an error.

**The `workflow:context` output for multiple workflows**:

```markdown
## Active Workflows

### 1. fix-auth-bug (Bug Fix, score: 6/15)
**Phase**: implement (in-progress)
**Branch**: workflow/fix-auth-bug

### 2. add-oauth-support (Complex, score: 12/15)
**Phase**: research (paused — interrupted)
**Branch**: workflow/add-oauth-support

Currently on branch: workflow/fix-auth-bug
Resume add-oauth-support by switching to its branch and continuing research.
```

**The common scenario**: Developer is working on a complex task, gets interrupted by a hotfix request. They start a new workflow for the hotfix (Quick Fix or Bug Fix tier), complete it, then resume the complex task. The `SessionStart` hook shows both, and the LLM knows which one to continue based on the current git branch.

**Rationale**: Real development isn't serial. Developers context-switch between tasks. Forcing them to abort one workflow to start another would mean losing work and learnings. Independent workflows with branch isolation make context-switching safe — `git stash` / `git checkout` is all that's needed, and the workflow state travels with the branch.

### Combined: The Full Activation Flow

```
Developer says something
  ↓
LLM evaluates task against 5 dimensions
  ↓
Score = 0?
  → YES: Just do it. No workflow, no announcement.
  → NO: Continue below.
  ↓
LLM announces: "This is a [tier] (score: X/15). [What happens next]."
  ↓
Calls workflow:init → plan dir, git branch, PLAN.md
  ↓
Workflow proceeds per tier DAG (ADR-001)
  ↓
At decision points → asks user via host tool
  ↓
At completion → workflow:retro, workflow:commit
  ↓
If interrupted → Stop hook records pause, SessionStart resumes next session
  ↓
If new task arrives mid-workflow → new independent workflow starts
```

## Consequences

### Positive

- **No friction on trivial tasks** — score-0 tasks proceed immediately without ceremony, preserving the "just do it" experience for simple changes
- **Transparent orchestration** — the announcement gives users visibility and a natural override point before the workflow commits to a tier
- **Natural interaction model** — using the host's native ask tool means users don't learn a new interaction pattern for workflow questions
- **Real-world context switching** — concurrent workflows match how developers actually work, with git branch isolation providing safety
- **Ambient resumability** — the SessionStart hook surfaces all active workflows, making resume a natural part of session start rather than an explicit action

### Negative

- **Score-0 boundary is a judgment call** — "all zeros" is a bright line, but a task the LLM scores at 0 might actually benefit from workflow tracking. The learning loop doesn't capture insights from skipped tasks
- **Announcement adds latency** — classification scoring happens before any work starts, adding a few seconds to every non-trivial task
- **Concurrent workflow complexity** — multiple active workflows require commands to handle `--plan` targeting and "most recently active" resolution, adding implementation complexity
- **Host tool fragmentation** — different hosts have different question tools with different capabilities (multi-select, previews, etc.); the SKILL.md can only describe the intent, not the exact tool invocation

## Alternatives Considered

### Always-On Workflow (Every Task Gets a Plan)

Run every code change through the workflow, even trivial ones. Provides consistent tracking and learning capture but adds unacceptable overhead for simple tasks. A developer who says "fix this typo" does not want to wait for a plan directory, git branch, and retrospective. Rejected because the ceremony-to-value ratio is wrong for score-0 tasks.

### User-Invoked Workflow (Explicit Opt-In)

Require the user to say "start a workflow" or use a specific command. Gives full user control but relies on the user knowing when they need the workflow — which is exactly what classification is designed to automate. Users who need the workflow most (high-risk, high-uncertainty tasks) are least likely to invoke it because they don't yet know the task is complex. Rejected because the LLM has better information for activation decisions than the user at task-start time.

### Single Active Workflow (Serial Only)

Allow only one active workflow at a time. Simpler implementation but forces users to abort in-progress work to handle interruptions. This is especially painful for Complex tasks that take multiple sessions — a hotfix request would mean losing all research and plan state. Rejected because it doesn't match real development patterns.

### Silent Workflow (No Announcement)

Activate the workflow without telling the user. Reduces noise but creates confusion when the user sees plan directories, git branches, and subagents appearing without explanation. Also removes the user's ability to override classification before work begins. Rejected because transparency is more important than brevity for a system that takes autonomous action.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md) — tier DAGs this activation selects between
- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md) — scoring system that determines activation threshold
- [ADR-005: Prompt-Based Orchestration Constraints](ADR-005-prompt-based-orchestration-constraints.md) — enforcement tiers and session hooks referenced here
- [ADR-006: Extension Manifest and Agent Asset Structure](ADR-006-extension-manifest-and-agent-assets.md) — commands and hooks that support concurrent workflows
