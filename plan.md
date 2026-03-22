# Plan: Create `renre-atlassian` Standard CLI Extension

## Overview

Convert the existing `atlassian-mcp` (MCP wrapper) into a new `renre-atlassian` **standard (in-process) CLI extension** following the same architecture as `chrome-debugger`. The extension exposes all 72+ Atlassian tools (Jira + Confluence) as individual CLI command handlers.

## Key Design Decisions

- **Type**: `"standard"` (in-process, NOT MCP) — same pattern as `chrome-debugger`
- **No MCP SDK dependency** — removes `@modelcontextprotocol/sdk`, uses direct REST API calls
- **Reuse existing clients** — `base-client.ts`, `jira-client.ts`, `confluence-client.ts` are clean REST wrappers, copy them
- **Reuse `jsonToMarkdown`** — from `@renre-kit/extension-sdk/node` for LLM-friendly output
- **Config reads from `ExecutionContext`** — domain/email/apiToken come from `context.config` (resolved by CLI core, vault-decrypted)
- **Command naming**: kebab-case for CLI — `renre-kit renre-atlassian:jira-get-issue`, `renre-kit renre-atlassian:confluence-search`, etc.
- **TDD methodology**: Write tests first for each module, then implementation
- **Local ESLint config**: `eslint.config.mjs` inside the extension (same pattern as `chrome-debugger`)

## Directory Structure

```
extensions/renre-atlassian/
├── manifest.json
├── package.json
├── build.js
├── tsconfig.json
├── tsconfig.lint.json
├── vitest.config.ts
├── eslint.config.mjs              # Local ESLint config
├── src/
│   ├── index.ts                   # onInit/onDestroy lifecycle hooks
│   ├── shared/
│   │   ├── types.ts               # ExecutionContext, CommandResult, AtlassianClientConfig
│   │   ├── client.ts              # Client factory: creates Jira/Confluence clients from context.config
│   │   ├── client.test.ts         # Tests for client factory
│   │   ├── formatters.ts          # toOutput/errorOutput helpers for CommandResult
│   │   └── formatters.test.ts     # Tests for formatters
│   ├── client/
│   │   ├── base-client.ts         # HTTP client (from atlassian-mcp)
│   │   ├── base-client.test.ts    # Tests for base client
│   │   ├── jira-client.ts         # Jira REST API wrapper (from atlassian-mcp)
│   │   ├── jira-client.test.ts    # Tests for Jira client
│   │   ├── confluence-client.ts   # Confluence REST API wrapper (from atlassian-mcp)
│   │   └── confluence-client.test.ts  # Tests for Confluence client
│   └── commands/
│       ├── status.ts              # Connection status command
│       ├── status.test.ts
│       ├── jira/
│       │   ├── get-issue.ts       # Each tool = one file
│       │   ├── search.ts
│       │   ├── get-project-issues.ts
│       │   ├── create-issue.ts
│       │   ├── update-issue.ts
│       │   ├── delete-issue.ts
│       │   ├── batch-create-issues.ts
│       │   ├── get-changelogs.ts
│       │   ├── search-fields.ts
│       │   ├── get-field-options.ts
│       │   ├── add-comment.ts
│       │   ├── edit-comment.ts
│       │   ├── get-transitions.ts
│       │   ├── transition-issue.ts
│       │   ├── get-all-projects.ts
│       │   ├── get-project-versions.ts
│       │   ├── get-project-components.ts
│       │   ├── create-version.ts
│       │   ├── batch-create-versions.ts
│       │   ├── get-agile-boards.ts
│       │   ├── get-board-issues.ts
│       │   ├── get-sprints-from-board.ts
│       │   ├── get-sprint-issues.ts
│       │   ├── create-sprint.ts
│       │   ├── update-sprint.ts
│       │   ├── add-issues-to-sprint.ts
│       │   ├── get-link-types.ts
│       │   ├── link-to-epic.ts
│       │   ├── create-issue-link.ts
│       │   ├── create-remote-issue-link.ts
│       │   ├── remove-issue-link.ts
│       │   ├── get-worklog.ts
│       │   ├── add-worklog.ts
│       │   ├── download-attachment.ts
│       │   ├── get-issue-images.ts
│       │   ├── get-user-profile.ts
│       │   ├── get-issue-watchers.ts
│       │   ├── add-watcher.ts
│       │   ├── remove-watcher.ts
│       │   ├── get-service-desks.ts
│       │   ├── get-service-desk-queues.ts
│       │   ├── get-queue-issues.ts
│       │   ├── get-issue-forms.ts
│       │   ├── get-form-details.ts
│       │   ├── update-form-answers.ts
│       │   ├── get-issue-dates.ts
│       │   ├── get-issue-sla.ts
│       │   ├── get-dev-info.ts
│       │   ├── get-dev-summary.ts
│       │   ├── get-batch-dev-info.ts
│       │   ├── issues.test.ts          # Grouped tests per domain
│       │   ├── fields.test.ts
│       │   ├── comments.test.ts
│       │   ├── transitions.test.ts
│       │   ├── projects.test.ts
│       │   ├── agile.test.ts
│       │   ├── links.test.ts
│       │   ├── worklog.test.ts
│       │   ├── attachments.test.ts
│       │   ├── users.test.ts
│       │   ├── watchers.test.ts
│       │   ├── service-desk.test.ts
│       │   ├── forms.test.ts
│       │   ├── metrics.test.ts
│       │   └── development.test.ts
│       └── confluence/
│           ├── search.ts
│           ├── get-page.ts
│           ├── get-page-children.ts
│           ├── get-page-history.ts
│           ├── create-page.ts
│           ├── update-page.ts
│           ├── delete-page.ts
│           ├── move-page.ts
│           ├── get-page-diff.ts
│           ├── get-comments.ts
│           ├── add-comment.ts
│           ├── reply-to-comment.ts
│           ├── get-labels.ts
│           ├── add-label.ts
│           ├── search-user.ts
│           ├── get-page-views.ts
│           ├── upload-attachment.ts
│           ├── upload-attachments.ts
│           ├── get-attachments.ts
│           ├── download-attachment.ts
│           ├── download-all-attachments.ts
│           ├── delete-attachment.ts
│           ├── get-page-images.ts
│           ├── pages.test.ts            # Grouped tests per domain
│           ├── comments.test.ts
│           ├── labels.test.ts
│           ├── users.test.ts
│           ├── analytics.test.ts
│           └── attachments.test.ts
├── agent/
│   └── skills/
│       ├── jira/
│       │   └── SKILL.md
│       └── confluence/
│           └── SKILL.md
└── src/ui/
    ├── panel.tsx
    ├── my-tasks-widget.tsx
    ├── comments-widget.tsx
    └── confluence-updates-widget.tsx
```

## Implementation Steps

### Phase 1: Project Scaffolding & Config Files

1. Create directory `extensions/renre-atlassian/`
2. Write `package.json` — no MCP SDK dependency, just `@renre-kit/extension-sdk`
3. Write `tsconfig.json` — ES2022, NodeNext, jsx: react-jsx
4. Write `tsconfig.lint.json` — extends tsconfig for ESLint projectService
5. Write `eslint.config.mjs` — local ESLint config (same pattern as chrome-debugger: typescript-eslint, sonarjs, import-x, unicorn, react-hooks)
6. Write `vitest.config.ts` — node environment, 86% coverage thresholds, exclude UI
7. Write `build.js` — entry points for all 72+ commands + UI panels

### Phase 2: Shared Types & Client Layer (TDD)

8. Write `src/shared/types.ts` — `ExecutionContext`, `CommandResult` interfaces
9. Write `src/client/base-client.test.ts` — mock fetch, test request/requestFormData/requestRaw/error handling
10. Write `src/client/base-client.ts` — copy from atlassian-mcp (clean REST wrapper)
11. Write `src/client/jira-client.test.ts` — mock base-client, test each method
12. Write `src/client/jira-client.ts` — copy from atlassian-mcp
13. Write `src/client/confluence-client.test.ts` — mock base-client, test each method
14. Write `src/client/confluence-client.ts` — copy from atlassian-mcp
15. Write `src/shared/client.test.ts` — test factory creates clients from context.config
16. Write `src/shared/client.ts` — factory function `createClients(context)` extracts domain/email/apiToken from config
17. Write `src/shared/formatters.test.ts` — test toOutput and errorOutput
18. Write `src/shared/formatters.ts` — `toOutput(data)` → CommandResult with markdown, `errorOutput(err)` → CommandResult with exitCode 1

### Phase 3: Jira Command Handlers (TDD)

Each command follows this pattern:
```typescript
export default async function handler(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.someMethod(context.args['param'] as string);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
```

For each group — write test file first, then all command implementations:

19. **Issues** (8 commands) — tests in `issues.test.ts`, implementations: `get-issue`, `search`, `get-project-issues`, `create-issue`, `update-issue`, `delete-issue`, `batch-create-issues`, `get-changelogs`
20. **Fields** (2) — tests in `fields.test.ts`: `search-fields`, `get-field-options`
21. **Comments** (2) — tests in `comments.test.ts`: `add-comment`, `edit-comment`
22. **Transitions** (2) — tests in `transitions.test.ts`: `get-transitions`, `transition-issue`
23. **Projects** (5) — tests in `projects.test.ts`: `get-all-projects`, `get-project-versions`, `get-project-components`, `create-version`, `batch-create-versions`
24. **Agile** (7) — tests in `agile.test.ts`: `get-agile-boards`, `get-board-issues`, `get-sprints-from-board`, `get-sprint-issues`, `create-sprint`, `update-sprint`, `add-issues-to-sprint`
25. **Links** (5) — tests in `links.test.ts`: `get-link-types`, `link-to-epic`, `create-issue-link`, `create-remote-issue-link`, `remove-issue-link`
26. **Worklog** (2) — tests in `worklog.test.ts`: `get-worklog`, `add-worklog`
27. **Attachments** (2) — tests in `attachments.test.ts`: `download-attachment`, `get-issue-images`
28. **Users** (1) — tests in `users.test.ts`: `get-user-profile`
29. **Watchers** (3) — tests in `watchers.test.ts`: `get-issue-watchers`, `add-watcher`, `remove-watcher`
30. **Service Desk** (3) — tests in `service-desk.test.ts`: `get-service-desks`, `get-service-desk-queues`, `get-queue-issues`
31. **Forms** (3) — tests in `forms.test.ts`: `get-issue-forms`, `get-form-details`, `update-form-answers`
32. **Metrics** (2) — tests in `metrics.test.ts`: `get-issue-dates`, `get-issue-sla`
33. **Development** (3) — tests in `development.test.ts`: `get-dev-info`, `get-dev-summary`, `get-batch-dev-info`

### Phase 4: Confluence Command Handlers (TDD)

34. **Pages** (9) — tests in `pages.test.ts`: `search`, `get-page`, `get-page-children`, `get-page-history`, `create-page`, `update-page`, `delete-page`, `move-page`, `get-page-diff`
35. **Comments** (3) — tests in `comments.test.ts`: `get-comments`, `add-comment`, `reply-to-comment`
36. **Labels** (2) — tests in `labels.test.ts`: `get-labels`, `add-label`
37. **Users** (1) — tests in `users.test.ts`: `search-user`
38. **Analytics** (1) — tests in `analytics.test.ts`: `get-page-views`
39. **Attachments** (7) — tests in `attachments.test.ts`: `upload-attachment`, `upload-attachments`, `get-attachments`, `download-attachment`, `download-all-attachments`, `delete-attachment`, `get-page-images`

### Phase 5: Manifest, Entry Point & Status Command

40. Write `manifest.json` — type `"standard"`, all 72+ commands with handler paths, config schema (domain, email, apiToken with vault), UI panels/widgets, agent skills
41. Write `src/index.ts` — onInit/onDestroy lifecycle hooks
42. Write `src/commands/status.test.ts` then `src/commands/status.ts` — connection status command

### Phase 6: Agent Skills (SKILL.md)

43. Write `agent/skills/jira/SKILL.md` — updated namespace `renre-atlassian:`, no MCP references
44. Write `agent/skills/confluence/SKILL.md` — updated namespace `renre-atlassian:`, no MCP references

### Phase 7: UI Panels & Widgets

45. Copy and adapt UI files from atlassian-mcp — update command namespaces from `atlassian-mcp:` to `renre-atlassian:`

### Phase 8: Validation

46. **Lint**: Run `npx eslint src/` with local `eslint.config.mjs` — fix all errors/warnings
47. **Typecheck**: Run `npx tsc --noEmit` — fix all type errors
48. **Tests**: Run `npx vitest run` — all tests pass with 86% coverage thresholds
49. **Duplication**: Run jscpd check — ensure < 5% threshold
50. **Build**: Run `node build.js` — verify all entry points compile and `dist/` is produced
51. Fix any issues found during validation

### Phase 9: Commit & Push

52. Git commit all files with descriptive message
53. Push to `claude/atlassian-cli-conversion-2lWL5`

## Config Schema

```json
{
  "domain": {
    "type": "string",
    "description": "Atlassian Cloud domain (e.g., mycompany.atlassian.net)",
    "secret": false
  },
  "email": {
    "type": "string",
    "description": "Atlassian account email address",
    "secret": false
  },
  "apiToken": {
    "type": "string",
    "description": "Atlassian API token",
    "secret": true,
    "vaultHint": "renre-atlassian.apiToken"
  }
}
```

## Command Naming Convention

MCP tool names used underscores (`jira_get_issue`). CLI commands use kebab-case:
- `renre-atlassian:jira-get-issue`
- `renre-atlassian:jira-search`
- `renre-atlassian:confluence-search`

## Test Strategy

- **Unit tests** co-located with source (`*.test.ts`)
- **Mock `fetch`** via `vi.stubGlobal('fetch', ...)` for all client tests
- **Mock `createClients`** via `vi.mock('../shared/client.js')` for command handler tests
- **Coverage**: 86% minimum (statements, branches, functions, lines)
- **Test grouping**: One test file per domain group (e.g., `issues.test.ts` covers all 8 issue commands)

## Validation Checklist

- [ ] `eslint src/` passes (local eslint.config.mjs) — no `any` types, complexity ≤ 10, cognitive ≤ 15
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes with 86% coverage (statements, branches, functions, lines)
- [ ] jscpd duplication < 5% threshold
- [ ] `node build.js` succeeds — `dist/` produced with all entry points
