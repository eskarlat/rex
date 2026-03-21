# Manifest Reference

Every extension has a `manifest.json` file that tells RenreKit everything it needs to know. This page documents every field.

## Full Schema

```json
{
  "name": "string (required)",
  "title": "string (optional, display name)",
  "version": "string (required, semver)",
  "description": "string (required)",
  "icon": "string (optional, path to icon file)",
  "iconColor": "string (optional, hex color for UI)",
  "type": "standard | mcp (required)",
  "main": "string (optional, lifecycle hooks entry point)",
  "engines": {
    "renre-kit": "string (required, semver range)",
    "extension-sdk": "string (required, semver range)"
  },
  "commands": {},
  "mcp": {},
  "config": {},
  "ui": {},
  "agent": {}
}
```

## Required Fields

### `name`

The unique identifier for your extension. Used in command namespacing (`name:command`) and directory naming.

```json
{ "name": "my-extension" }
```

- Must be lowercase
- Can contain hyphens
- Must be unique within a registry

### `version`

Semver version string.

```json
{ "version": "1.2.3" }
```

### `description`

A short description shown in the marketplace and CLI output.

```json
{ "description": "Integrates with the Acme API for task management" }
```

### `type`

The extension type — determines how RenreKit loads and communicates with it.

```json
{ "type": "standard" }
```

| Value | Behavior |
|-------|----------|
| `"standard"` | Loaded in-process via `require()` |
| `"mcp"` | Communicates via JSON-RPC (stdio or SSE) |

### `engines`

**Mandatory.** Declares which versions of RenreKit and the Extension SDK your extension is compatible with.

```json
{
  "engines": {
    "renre-kit": ">= 1.0.0",
    "extension-sdk": ">= 1.0.0"
  }
}
```

Both fields are required. RenreKit checks these at install time and skips incompatible extensions.

## Optional Fields

### `title`

A human-readable display name. If omitted, `name` is used.

```json
{ "title": "My Awesome Extension" }
```

### `icon`

Path to an SVG or PNG icon file, relative to the extension root.

```json
{ "icon": "icon.svg" }
```

### `iconColor`

Hex color used as the extension's accent in the UI.

```json
{ "iconColor": "#818cf8" }
```

### `main`

Path to the compiled entry point that exports lifecycle hooks (`onInit`, `onDestroy`). Only needed for standard extensions.

```json
{ "main": "dist/index.js" }
```

## Commands

Maps command names to their handlers. Each command becomes `{extension-name}:{command-name}` in the CLI.

```json
{
  "commands": {
    "greet": {
      "handler": "dist/commands/greet.js",
      "description": "Say hello to someone"
    },
    "info": {
      "handler": "dist/commands/info.js",
      "description": "Show extension information"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `handler` | `string` | Yes | Path to the compiled command handler |
| `description` | `string` | Yes | Short description shown in help text |

## MCP Configuration

Only required when `type` is `"mcp"`.

### stdio transport

```json
{
  "mcp": {
    "transport": "stdio",
    "command": "node",
    "args": ["dist/server.js"],
    "env": {
      "API_TOKEN": "${config.apiToken}"
    }
  }
}
```

### SSE transport

```json
{
  "mcp": {
    "transport": "sse",
    "url": "https://mcp-server.example.com/sse",
    "headers": {
      "Authorization": "Bearer ${config.apiToken}"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transport` | `"stdio" \| "sse"` | Yes | Communication protocol |
| `command` | `string` | stdio only | Command to spawn |
| `args` | `string[]` | No | Arguments for the command |
| `env` | `Record<string, string>` | No | Environment variables (supports `${config.*}` interpolation) |
| `url` | `string` | SSE only | URL of the SSE endpoint |
| `headers` | `Record<string, string>` | No | HTTP headers for SSE connection |

### Config Interpolation

Environment variables and headers support `${config.fieldName}` syntax. RenreKit resolves these from the extension's config (including vault-mapped secrets) before spawning the process or connecting.

## Config Schema

Defines user-configurable fields. These appear in the CLI (`ext:config`) and dashboard settings.

```json
{
  "config": {
    "schema": {
      "apiUrl": {
        "type": "string",
        "description": "Base URL for the API",
        "default": "https://api.example.com",
        "secret": false
      },
      "apiToken": {
        "type": "string",
        "description": "API authentication token",
        "secret": true,
        "vaultHint": "MY_API_TOKEN"
      },
      "maxRetries": {
        "type": "number",
        "description": "Maximum retry attempts",
        "default": 3,
        "secret": false
      },
      "debugMode": {
        "type": "boolean",
        "description": "Enable verbose logging",
        "default": false,
        "secret": false
      }
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"string" \| "number" \| "boolean"` | Yes | The value type |
| `description` | `string` | Yes | Shown in the UI and CLI |
| `default` | `string \| number \| boolean` | No | Default value if not configured |
| `secret` | `boolean` | Yes | Whether the value is encrypted/masked |
| `vaultHint` | `string` | No | Vault key name for automatic lookup |

## UI Configuration

### Panels

Full-page React components shown in the dashboard sidebar.

```json
{
  "ui": {
    "panels": [
      {
        "id": "main-panel",
        "title": "My Extension",
        "entry": "dist/panel.js"
      },
      {
        "id": "settings-panel",
        "title": "Settings",
        "entry": "dist/settings-panel.js"
      }
    ]
  }
}
```

### Widgets

Small components placed on the dashboard grid.

```json
{
  "ui": {
    "widgets": [
      {
        "id": "status-widget",
        "title": "Status",
        "entry": "dist/status-widget.js",
        "defaultSize": { "w": 4, "h": 2 },
        "minSize": { "w": 2, "h": 1 },
        "maxSize": { "w": 8, "h": 4 }
      }
    ]
  }
}
```

#### Size Constraints

Sizes use a 12-column grid:

| Property | Description | Constraints |
|----------|-------------|-------------|
| `defaultSize` | Initial size when added to dashboard | Required |
| `minSize` | Smallest allowed size | Optional, must not exceed maxSize |
| `maxSize` | Largest allowed size | Optional, must not be smaller than minSize |
| `w` (width) | Grid columns | 1–12 |
| `h` (height) | Grid rows | 1+ (each row ≈ 100px) |

## Agent Assets

LLM-related files that get deployed to the project's `.agents/` directory.

```json
{
  "agent": {
    "skills": [
      { "name": "my-skill", "path": "agent/skills/my-skill/SKILL.md" }
    ],
    "prompts": [
      "agent/prompts/template.prompt.md"
    ],
    "context": [
      "agent/context/reference.context.md"
    ],
    "hooks": [
      "agent/hooks/pre-commit.hook.md"
    ],
    "agents": [
      "agent/agents/helper.agent.md"
    ],
    "workflows": [
      "agent/workflows/review.workflow.md"
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `skills` | `{ name, path }[]` | SKILL.md files (structured how-to docs) |
| `prompts` | `string[]` | Prompt templates |
| `context` | `string[]` | Background reference documents |
| `hooks` | `string[]` | Hook configurations |
| `agents` | `string[]` | Agent definitions |
| `workflows` | `string[]` | Workflow definitions |
