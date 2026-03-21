# Reference Extensions

The RenreKit repository includes several reference extensions that demonstrate different patterns and capabilities. Use these as starting points or learning material.

## hello-world (Standard)

**The go-to example for standard extensions.** This covers every feature an extension can have.

| Feature | Details |
|---------|---------|
| **Type** | Standard (in-process) |
| **Commands** | `greet`, `info` |
| **Panels** | Main panel, Settings panel, Analytics panel |
| **Widgets** | Status widget |
| **Config** | `companyName` (string), `apiToken` (secret) |
| **Agent assets** | Skills, prompts, context |

### What to learn from it

- Full manifest with all optional sections
- Lifecycle hooks (onInit/onDestroy) with agent asset deployment
- Command handler pattern (ExecutionContext → CommandResult)
- UI panel with SDK components
- Config schema with both regular and secret fields
- SKILL.md format for LLM skills

```
extensions/hello-world/
├── manifest.json
├── src/index.ts              # Lifecycle hooks
├── src/commands/greet.ts     # Command handler
├── src/ui/panel.tsx          # Dashboard panel
├── src/ui/status-widget.tsx  # Dashboard widget
└── agent/
    ├── skills/greet/SKILL.md
    ├── prompts/greeting-style.prompt.md
    └── context/extension-docs.context.md
```

## github-mcp (MCP stdio)

**Wraps the official GitHub MCP server** via npx.

| Feature | Details |
|---------|---------|
| **Type** | MCP stdio |
| **MCP command** | `npx -y @modelcontextprotocol/server-github` |
| **Config** | `githubToken` (secret), `githubHost` (string) |
| **Panels** | Main panel |
| **Widgets** | Status widget |

### What to learn from it

- Wrapping a third-party MCP server
- Config interpolation in `mcp.env`
- Local status command alongside MCP tools

## atlassian-mcp (MCP stdio)

**Jira + Confluence integration** via the Atlassian MCP server.

| Feature | Details |
|---------|---------|
| **Type** | MCP stdio |
| **Config** | `atlassianToken`, `atlassianEmail`, `siteUrl` (all secret/string) |
| **Panels** | Main panel |
| **Widgets** | My Tasks, Confluence Updates, Comments |
| **Skills** | Jira management, Confluence search |

### What to learn from it

- Multiple widgets from one extension
- Custom MCP client wrapping (base-client pattern)
- Rich dashboard UI with task lists and activity feeds
- Multiple SKILL.md files per extension

## miro-mcp (MCP stdio)

**Miro whiteboarding with 98 tools** — the most comprehensive MCP extension.

| Feature | Details |
|---------|---------|
| **Type** | MCP stdio |
| **Tools** | 98 MCP tools (boards, items, shapes, connectors, etc.) |
| **Config** | `accessToken` (secret) |
| **Panels** | Main panel |
| **Widgets** | Status widget |

### What to learn from it

- Building a full MCP server (not just wrapping one)
- CRUD factory pattern for generating similar toolsets
- Comprehensive test suite for MCP tools
- Custom client with authentication

## context7-mcp (MCP stdio)

**Context7 integration** for library documentation lookup.

| Feature | Details |
|---------|---------|
| **Type** | MCP stdio |
| **Config** | Minimal |
| **Panels** | Main panel |
| **Widgets** | Status widget |

### What to learn from it

- Minimal MCP extension structure
- Simple wrapper pattern

## figma-mcp (MCP stdio)

**Figma design tool integration.**

| Feature | Details |
|---------|---------|
| **Type** | MCP stdio |
| **Config** | `figmaToken` (secret) |
| **Panels** | Main panel |
| **Widgets** | Status widget |

### What to learn from it

- Design tool integration pattern
- Simple config with vault hint

## chrome-debugger (Standard)

**Browser automation and screenshots** — a standard extension with a unique capability.

| Feature | Details |
|---------|---------|
| **Type** | Standard |
| **Skills** | Browser navigate, screenshot, inspect |
| **Panels** | Main panel |
| **Widgets** | Browser widget |

### What to learn from it

- Standard extension with multiple AI skills
- Browser automation integration
- Interactive widget with URL input

## Quick Comparison

| Extension | Type | Commands | Panels | Widgets | Config Fields | Skills |
|-----------|------|----------|--------|---------|---------------|--------|
| hello-world | Standard | 2 | 3 | 1 | 2 | 2 |
| github-mcp | MCP | 1 | 1 | 1 | 2 | 1 |
| atlassian-mcp | MCP | 1 | 1 | 3 | 3 | 2 |
| miro-mcp | MCP | 1 | 1 | 1 | 1 | 1 |
| context7-mcp | MCP | 0 | 1 | 1 | 0 | 1 |
| figma-mcp | MCP | 0 | 1 | 1 | 1 | 1 |
| chrome-debugger | Standard | 0 | 1 | 1 | 0 | 3 |

All reference extensions live in the `extensions/` directory at the root of the repository.
