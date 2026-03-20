# ADR-006: Extension Manifest and Agent Asset Structure

## Status

Proposed

## Context

The developer workflow extension must be packaged as a standard RenreKit extension following the established conventions (see hello-world reference extension). This means defining a `manifest.json`, CLI commands, lifecycle hooks (`onInit`/`onDestroy`), and agent assets (skills, prompts, context, hooks).

The extension is unique because its **commands serve two audiences**: the LLM (called via SKILL.md instructions during workflow execution) and the user (called directly from the CLI for status, management, and debugging). Additionally, the session hook mechanism allows the extension to inject workflow state and project learnings into every LLM session automatically.

This ADR defines the complete extension structure — manifest, commands, hooks, and the agent asset layout including skill folders with reference examples.

## Decision

### Extension Manifest

```json
{
  "name": "renre-developer-workflow",
  "title": "Developer Workflow",
  "version": "0.1.0",
  "description": "Structured, multi-agent workflow orchestration for development tasks",
  "type": "standard",
  "main": "dist/index.js",
  "commands": {
    "workflow:init": {
      "handler": "dist/commands/workflow-init.js",
      "description": "Initialize a new workflow — creates plan directory, classifies task, creates git branch"
    },
    "workflow:progress": {
      "handler": "dist/commands/workflow-progress.js",
      "description": "Record a phase transition in the active workflow"
    },
    "workflow:validate": {
      "handler": "dist/commands/workflow-validate.js",
      "description": "Run validation suite (lint, typecheck, tests, duplication) and track retry count"
    },
    "workflow:status": {
      "handler": "dist/commands/workflow-status.js",
      "description": "Show status of active and recent workflows"
    },
    "workflow:context": {
      "handler": "dist/commands/workflow-context.js",
      "description": "Return workflow state and project learnings for LLM session context"
    },
    "workflow:commit": {
      "handler": "dist/commands/workflow-commit.js",
      "description": "Create a conventional commit for the current workflow phase"
    },
    "workflow:retro": {
      "handler": "dist/commands/workflow-retro.js",
      "description": "Archive retrospective and update learnings in global/project memory"
    },
    "workflow:abort": {
      "handler": "dist/commands/workflow-abort.js",
      "description": "Abort the active workflow with a reason, trigger retrospective"
    },
    "workflow:list": {
      "handler": "dist/commands/workflow-list.js",
      "description": "List all workflows (active, completed, aborted) for the current project"
    },
    "workflow:hook": {
      "handler": "dist/commands/workflow-hook.js",
      "description": "Internal command for agent hook lifecycle events (session-end, pre-compact, subagent-start, subagent-stop, post-tool-use, error-occurred)"
    }
  },
  "config": {
    "schema": {
      "validationCommand": {
        "type": "string",
        "description": "Custom validation command (default: pnpm validate)",
        "secret": false,
        "default": "pnpm validate"
      },
      "maxRetries": {
        "type": "number",
        "description": "Maximum validation retries before escalating to user",
        "secret": false,
        "default": 3
      },
      "gitBranch": {
        "type": "boolean",
        "description": "Create a git branch per workflow",
        "secret": false,
        "default": true
      }
    }
  },
  "ui": {
    "panels": [
      {
        "id": "workflow-dashboard",
        "title": "Workflows",
        "entry": "dist/panels/workflow-dashboard.js"
      },
      {
        "id": "workflow-detail",
        "title": "Workflow Detail",
        "entry": "dist/panels/workflow-detail.js"
      }
    ],
    "widgets": [
      {
        "id": "active-workflow",
        "title": "Active Workflow",
        "entry": "dist/widgets/active-workflow.js",
        "defaultSize": { "w": 6, "h": 3 },
        "minSize": { "w": 4, "h": 2 },
        "maxSize": { "w": 12, "h": 6 }
      }
    ]
  },
  "engines": {
    "renre-kit": ">=0.1.0",
    "extension-sdk": ">=0.1.0"
  },
  "agent": {
    "skills": [
      { "name": "orchestrate", "path": "agent/skills/orchestrate" },
      { "name": "classify", "path": "agent/skills/classify" },
      { "name": "research", "path": "agent/skills/research" },
      { "name": "implement", "path": "agent/skills/implement" },
      { "name": "review", "path": "agent/skills/review" }
    ],
    "prompts": [
      "agent/prompts/orchestrator-role.prompt.md",
      "agent/prompts/agent-output-format.prompt.md"
    ],
    "context": [
      "agent/context/workflow-overview.context.md",
      "agent/context/dag-reference.context.md"
    ],
    "hooks": [
      "agent/hooks/workflow-hooks.json"
    ]
  }
}
```

### Commands — Two Audiences

Commands serve both the **LLM** (called via SKILL.md during workflow execution) and the **user** (called directly for management). The distinction is in how they're invoked, not how they're implemented:

| Command | LLM Use (via SKILL.md) | User Use (direct CLI) |
|---------|----------------------|---------------------|
| `workflow:init` | Called at workflow start with task description and dimension scores | Rarely called directly; LLM handles classification |
| `workflow:progress` | Called at each phase transition to record state | User can call to manually update progress |
| `workflow:validate` | Called at gate nodes; tracks retry count | User can call to run validation independently |
| `workflow:status` | Called implicitly via session hook | User calls to check workflow state |
| `workflow:context` | Called by session hook automatically | User can call to see what context the LLM receives |
| `workflow:commit` | Called after each phase to create git commit | User can call to manually commit |
| `workflow:retro` | Called at workflow end to archive learnings | User can call to manually trigger archival |
| `workflow:abort` | Called when abort conditions are met | User calls to explicitly cancel a workflow |
| `workflow:list` | Not typically called by LLM | User calls to see all workflows |
| `workflow:hook` | Called automatically by agent hook lifecycle | Not called directly; internal plumbing for session-end, pre-compact, subagent tracking, error logging |

### Command Argument Patterns

Each command follows the standard `ExecutionContext` pattern:

**`workflow:init`** — initializes a new workflow:
```
args: {
  name: string,              # Plan name (kebab-case)
  description: string,       # Task description
  scores?: string,           # "files=2,domain=1,risk=2,deps=1,uncertainty=2" (LLM-provided)
  tier?: string,             # User override: "quick-fix" | "bug-fix" | "complex"
}
```
Returns: plan directory path, computed tier, applied floor rules (if any).

**`workflow:progress`** — records a phase transition:
```
args: {
  phase: string,             # Phase name (classify, research, merge, plan, implement, validate, retro)
  status: string,            # "complete" | "in-progress" | "aborted" | "resumed"
  notes?: string,            # Free-text context for this entry
  agents?: number,           # Number of agents used in this phase
}
```
Returns: confirmation with current progress summary.

**`workflow:validate`** — runs validation and tracks retries:
```
args: {
  plan?: string,             # Plan name (defaults to active workflow)
}
```
Returns: pass/fail, failure details, retry count, whether retry limit was reached.

**`workflow:context`** — returns session context:
```
args: {}                     # No args needed; reads project state automatically
```
Returns: active workflow summary (if any), project LEARNINGS.md relevant sections, global classification insights.

**`workflow:abort`** — aborts the active workflow:
```
args: {
  reason: string,            # "infeasible" | "retry-limit" | "user-cancelled" | custom string
}
```
Returns: confirmation, prompts orchestrator to generate RETROSPECTIVE.md.

### Agent Hook Lifecycle

The extension leverages the full hook system to provide **automatic workflow observability** without requiring the LLM to explicitly call tracking commands. The hooks file defines handlers for the complete session lifecycle:

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "renre-kit workflow:context"
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook session-end"
      }
    ],
    "PreCompact": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook pre-compact"
      }
    ],
    "SubagentStart": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook subagent-start"
      }
    ],
    "SubagentStop": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook subagent-stop"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook post-tool-use"
      }
    ],
    "ErrorOccurred": [
      {
        "type": "command",
        "command": "renre-kit workflow:hook error-occurred"
      }
    ]
  }
}
```

#### Hook Behaviors

| Hook | Trigger | What It Does |
|------|---------|-------------|
| **SessionStart** | New LLM session begins | Runs `workflow:context` — injects active workflow state + project learnings into session. If an active workflow exists, returns resume instructions. If none, returns ambient project knowledge. |
| **Stop** | Session ends (user closes, timeout) | Writes a `paused` entry to `progress.md` with the current phase and timestamp. Ensures the next session's `SessionStart` hook can detect an interrupted workflow and offer resume. |
| **PreCompact** | Context window about to be compacted | Writes a **checkpoint** to `progress.md` capturing what the orchestrator has accomplished so far. This is critical — context compaction loses nuance, so the checkpoint preserves the workflow's structural state even if the LLM's memory of details is compressed. |
| **SubagentStart** | A subagent is spawned | Records the subagent's role and assigned phase in `progress.md`. This gives automatic **parallel agent tracking** — the extension knows how many agents are active without the orchestrator SKILL.md needing to explicitly report it. |
| **SubagentStop** | A subagent completes | Records the subagent's completion status and updates agent count. Combined with SubagentStart, this provides an automatic audit trail of parallel execution. |
| **PostToolUse** | Any tool completes | Lightweight tracking — if the tool was a file write to the plan directory, logs it. This creates an automatic manifest of which plan files were created/modified without the LLM needing to report each one. |
| **ErrorOccurred** | An error is encountered | Appends the error to a `review/errors.md` log in the plan directory. If errors accumulate beyond a threshold, the next `workflow:context` call surfaces them as a warning to the orchestrator. |

#### SessionStart Output

The `workflow:context` command returns structured output that becomes part of the LLM's initial context:

```markdown
## Active Workflow

**Plan**: fix-auth-race-condition
**Tier**: Bug Fix (score: 6/15)
**Current Phase**: implement (in-progress)
**Last Completed**: merge (2025-03-15T10:32:00Z)
**Next Expected**: validate
**Active Agents**: 0 (last agent completed at 10:33:00Z)
**Errors**: none

Resume this workflow by continuing implementation based on the plan at `.renre-kit/plan/fix-auth-race-condition/PLAN.md`.

## Project Knowledge

### Architecture
- Uses repository pattern for all data access
- Auth module has circular deps — always import from facade.ts

### Codebase Quirks
- noUncheckedIndexedAccess enabled; always handle potential undefined
- ESLint disallows default exports

### Testing
- Integration tests require RENRE_KIT_HOME set to temp directory
```

When no active workflow exists, only the project knowledge section is returned.

#### What Hooks Move from Advisory to Automatic

The hook lifecycle shifts several elements from ADR-005's Tier 3 (Advisory) to **automatically tracked**:

| Previously Advisory | Now Automatic Via | Benefit |
|--------------------|-------------------|---------|
| Parallel agent tracking | SubagentStart/SubagentStop | Extension knows how many agents ran without LLM self-reporting |
| Progress recording on interruption | Stop hook | Workflow pause is always recorded, even if LLM didn't call `workflow:progress` |
| Context preservation before compaction | PreCompact hook | Structural state survives context window compression |
| Error accumulation tracking | ErrorOccurred hook | Errors are logged without the LLM deciding to report them |
| Plan file manifest | PostToolUse hook | Automatic record of which files were created/modified |

### Agent Asset Layout

The full agent asset directory structure with skill folders:

```
agent/
├── skills/
│   ├── orchestrate/                    # Main orchestration skill
│   │   ├── SKILL.md                    # DAG management, phase transitions, agent spawning
│   │   ├── examples/
│   │   │   ├── quick-fix-walkthrough.md
│   │   │   ├── bug-fix-walkthrough.md
│   │   │   └── complex-task-walkthrough.md
│   │   └── context/
│   │       ├── dag-definitions.md      # Formal DAG graphs for each tier
│   │       └── command-reference.md    # All workflow:* commands with examples
│   ├── classify/                       # Classification skill
│   │   ├── SKILL.md                    # 5-dimension scoring, floor rules, tier mapping
│   │   ├── examples/
│   │   │   ├── quick-fix-examples.md   # 3-4 tasks that score 0-3
│   │   │   ├── bug-fix-examples.md     # 3-4 tasks that score 4-7
│   │   │   └── complex-examples.md     # 3-4 tasks that score 8+
│   │   └── context/
│   │       └── scoring-rubric.md       # Detailed per-dimension scoring guide with edge cases
│   ├── research/                       # Research agent skill
│   │   ├── SKILL.md                    # How to investigate codebase, produce findings
│   │   ├── examples/
│   │   │   └── research-output.md      # Example research output following template
│   │   └── context/
│   │       └── output-template.md      # Agent output file template
│   ├── implement/                      # Implementation agent skill
│   │   ├── SKILL.md                    # How to implement from plan, respect file ownership
│   │   ├── examples/
│   │   │   └── module-implementation.md
│   │   └── context/
│   │       └── file-ownership-rules.md # Parallel implementation ownership protocol
│   └── review/                         # Review/validation agent skill
│       ├── SKILL.md                    # Gap analysis, validation interpretation
│       └── examples/
│           └── gap-analysis-output.md  # Example gap analysis following template
├── prompts/
│   ├── orchestrator-role.prompt.md     # System prompt for orchestrator behavior
│   └── agent-output-format.prompt.md   # Standard output format for all agents
├── context/
│   ├── workflow-overview.context.md    # High-level explanation of the workflow system
│   └── dag-reference.context.md        # Visual DAG diagrams for each tier
└── hooks/
    └── workflow-hooks.json             # SessionStart hook definition
```

### Skill Folder Purpose

Each skill folder (`SKILL.md` + `examples/` + `context/`) serves a specific role:

- **SKILL.md** — the primary instruction document. Tells the LLM *what* to do and *when* to use commands. Contains the `name` and `description` in frontmatter for discovery.
- **examples/** — few-shot demonstrations. Complete walkthroughs showing inputs, expected outputs, and the resulting plan directory contents. The LLM reads these to pattern-match rather than interpret abstract instructions.
- **context/** — reference material. Scoring rubrics, output templates, command reference, file ownership rules. Loaded on-demand when the LLM needs detailed specifications during a phase.

### Lifecycle Hooks

```typescript
// src/index.ts
import { deployAgentAssets, cleanupAgentAssets } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  // Deploy all agent assets to .agents/ with renre-developer-workflow.* prefixing
  deployAgentAssets(getExtensionDir(), context.projectDir, context.agentDir);

  // Initialize project memory directory if it doesn't exist
  initializeMemoryDirs(context.projectDir);
}

export function onDestroy(context: HookContext): void {
  // Clean up agent assets from .agents/
  cleanupAgentAssets(getExtensionDir(), context.projectDir, context.agentDir);
  // Note: memory directories are preserved — learnings survive deactivation
}
```

The `onInit` hook also creates the project memory directory structure if it doesn't exist:

```
.renre-kit/storage/renre-developer-workflow/memory/
├── LEARNINGS.md          # Empty template with section headers
├── patterns/
├── pitfalls/
└── retrospectives/
```

### Deployed Agent Asset Paths

After activation, the `.agents/` directory contains:

```
.agents/
├── skills/
│   ├── renre-developer-workflow.orchestrate/
│   │   ├── SKILL.md          # name: renre-developer-workflow.orchestrate
│   │   ├── examples/
│   │   │   ├── quick-fix-walkthrough.md
│   │   │   ├── bug-fix-walkthrough.md
│   │   │   └── complex-task-walkthrough.md
│   │   └── context/
│   │       ├── dag-definitions.md
│   │       └── command-reference.md
│   ├── renre-developer-workflow.classify/
│   │   └── ...
│   ├── renre-developer-workflow.research/
│   │   └── ...
│   ├── renre-developer-workflow.implement/
│   │   └── ...
│   └── renre-developer-workflow.review/
│       └── ...
├── prompts/
│   ├── renre-developer-workflow.orchestrator-role.prompt.md
│   └── renre-developer-workflow.agent-output-format.prompt.md
├── context/
│   ├── renre-developer-workflow.workflow-overview.context.md
│   └── renre-developer-workflow.dag-reference.context.md
└── hooks/
    └── renre-developer-workflow.workflow-hooks.json
```

## Consequences

### Positive

- **Standard extension packaging** — follows established RenreKit conventions; no special infrastructure needed
- **Commands provide enforcement backbone** — 9 commands cover all structural operations that the SKILL.md cannot enforce alone
- **Session hook provides ambient context** — every LLM session starts with project knowledge and active workflow state automatically
- **Skill folders enable few-shot learning** — examples alongside SKILL.md are more effective than abstract instructions
- **Separation of concerns** — orchestrate, classify, research, implement, and review are independent skills that can be improved individually
- **User and LLM share the same commands** — no separate API; debugging is transparent
- **Memory survives deactivation** — project learnings persist even if the extension is temporarily deactivated

### Negative

- **9 commands is a large surface** — more code to implement, test, and maintain than a simpler extension
- **Skill proliferation** — 5 skill folders with examples and context add up to many files; initial authoring effort is significant
- **Namespace verbosity** — `renre-developer-workflow.orchestrate` is a long prefix; LLMs must reference these full names
- **Session hook overhead** — `workflow:context` runs on every session start; must be fast even when no workflow is active

## Alternatives Considered

### Single Monolithic Skill

One large SKILL.md containing all orchestration, classification, research, implementation, and review instructions. Simpler structure but creates a massive single file that's hard to maintain and exceeds what a single LLM context can comfortably hold. Rejected because skill-per-role allows selective loading and independent improvement.

### No CLI Commands (Pure SKILL.md)

Rely entirely on SKILL.md file operations for all workflow management. No enforcement tier for plan structure, validation tracking, memory management, or git operations. Rejected because the extension infrastructure exists specifically to provide command-backed enforcement (see ADR-005).

### MCP Extension Type

Package as an MCP (stdio) extension instead of standard. Would provide tool-call semantics rather than command execution, which some LLM hosts handle better. However, MCP extensions can't use `onInit`/`onDestroy` hooks for agent asset deployment, and the additional process management overhead isn't justified. Rejected because standard type provides hooks + commands + agent assets in one package.

## Related Decisions

- [ADR-001: DAG-Based Workflow Orchestration](ADR-001-dag-based-workflow-orchestration.md) — DAG structure these commands support
- [ADR-002: Task Classification and Routing](ADR-002-task-classification-and-routing.md) — classification logic `workflow:init` enforces
- [ADR-003: File-Based Agent Communication Protocol](ADR-003-file-based-agent-communication.md) — file protocol commands read/write
- [ADR-004: Retrospective Knowledge Memory](ADR-004-retrospective-knowledge-memory.md) — memory `workflow:retro` and `workflow:context` manage
- [ADR-005: Prompt-Based Orchestration Constraints](ADR-005-prompt-based-orchestration-constraints.md) — enforcement tiers these commands fulfill
- [ADR-001: SKILL.md Convention](../llm-skills/ADR-001-skill-md-convention.md) — skill folder conventions followed
- [ADR-002: Two-Layer LLM Context](../llm-skills/ADR-002-two-layer-llm-context.md) — agent asset deployment model
