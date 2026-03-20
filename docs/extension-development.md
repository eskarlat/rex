# Extension Development Guide

This guide covers everything you need to build, test, and publish RenreKit extensions.

## Quick Start

Scaffold a new extension:

```bash
npx create-renre-extension my-extension        # standard extension
npx create-renre-extension my-mcp-ext --type mcp  # MCP extension
```

Link it for local development:

```bash
renre-kit ext:link ./my-extension
```

Your extension is now installed and activated. Changes to source files reflect immediately after rebuilding (`tsc`).

## Extension Types

### Standard Extensions

Run in-process. Commands are JavaScript files loaded via `import()`. Best for tools that need direct filesystem access, database queries, or tight integration with the host environment.

### MCP Extensions

Run as separate processes communicating via JSON-RPC over stdio (or SSE). The MCP server defines its own tools — no need to declare them in the manifest. Best for sandboxed tools, language-agnostic servers, or services that maintain state across calls.

## File Structure

### Standard Extension

```
my-extension/
├── manifest.json              # extension metadata and configuration
├── package.json               # npm package with build scripts
├── tsconfig.json              # TypeScript config
├── src/
│   └── index.ts               # lifecycle hooks (onInit, onDestroy)
├── commands/
│   ├── greet.ts               # one file per command, exports default function
│   └── info.ts
├── ui/
│   └── panel.tsx              # React component for the web dashboard
└── agent/
    ├── skills/
    │   └── greet/SKILL.md     # LLM skill definitions
    ├── prompts/
    │   └── style.md           # prompt templates
    └── context/
        └── docs.md            # reference documents for LLM context
```

### MCP Extension

```
my-mcp-ext/
├── manifest.json
├── package.json
├── tsconfig.json
├── src/
│   └── server.ts              # JSON-RPC stdio server
├── commands/
│   └── status.ts              # optional local commands (file-based)
├── ui/
│   └── panel.tsx
└── agent/
    └── skills/
        └── tool-name/SKILL.md
```

## Manifest Reference

The `manifest.json` is the single source of truth for your extension's configuration.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique extension identifier |
| `version` | string | Semver version |
| `description` | string | Short description for marketplace listing |
| `type` | `"standard"` \| `"mcp"` | Extension type |
| `commands` | object | Command declarations (can be `{}` for MCP-only) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `main` | string | Entry point module for lifecycle hooks (`onInit`/`onDestroy`) |
| `icon` | string | Icon name for dashboard display |
| `mcp` | object | MCP transport config (required when `type: "mcp"`) |
| `ui.panels` | array | Dashboard panel definitions |
| `agent` | object | LLM asset declarations (skills, prompts, context, agents, workflows) |
| `engines` | object | Minimum version constraints for `renre-kit` and `extension-sdk` |
| `config.schema` | object | Configuration fields with types, descriptions, and vault hints |

### Full Example (Standard)

```json
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "A simple hello world extension",
  "icon": "wave",
  "type": "standard",
  "engines": {
    "renre-kit": ">=0.0.1",
    "extension-sdk": ">=0.0.1"
  },
  "main": "src/index.js",
  "commands": {
    "greet": {
      "handler": "commands/greet.js",
      "description": "Greet the user"
    }
  },
  "ui": {
    "panels": [
      { "id": "hello-panel", "title": "Hello World", "entry": "ui/panel.js" }
    ]
  },
  "agent": {
    "skills": [
      { "name": "greet", "path": "agent/skills/greet/SKILL.md" }
    ],
    "prompts": ["agent/prompts/style.md"],
    "context": ["agent/context/docs.md"]
  }
}
```

### Full Example (MCP)

```json
{
  "name": "my-mcp-ext",
  "version": "1.0.0",
  "description": "My MCP extension",
  "type": "mcp",
  "engines": {
    "renre-kit": ">=0.0.1",
    "extension-sdk": ">=0.0.1"
  },
  "main": "src/server.js",
  "commands": {},
  "mcp": {
    "transport": "stdio",
    "command": "node",
    "args": ["src/server.js"]
  },
  "agent": {
    "skills": [
      { "name": "echo", "path": "agent/skills/echo/SKILL.md" }
    ]
  }
}
```

MCP tools are defined in the server, not in the manifest. The CLI forwards any `my-mcp-ext:<tool>` call to the MCP server automatically. You can optionally declare local file-based commands in `commands` for utilities that don't need the MCP server (e.g., `status`, `config`).

## Three Interaction Modes

Extensions can provide functionality through three modes. All are optional — use what you need.

### 1. CLI Commands

Each command is a separate file in `commands/` that exports a `default` function:

```typescript
// commands/greet.ts
interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

export default function greet(context: ExecutionContext) {
  const name = (context.args._positional as string[])?.[0] ?? 'World';
  return {
    output: `Hello, ${name}!`,
    exitCode: 0,
  };
}
```

The command name in the manifest maps to the file:

```json
"commands": {
  "greet": { "handler": "commands/greet.js", "description": "Greet the user" }
}
```

Users run it as `renre-kit {extension-name}:greet Alice`. The extension name is auto-prefixed — don't include it in the manifest key.

**Arguments**: Positional args arrive in `context.args._positional` as a string array. Parsed options from Commander.js flags are spread into `context.args`.

### 2. Dashboard UI Panels

Panels are React components loaded dynamically by the web dashboard:

```tsx
// ui/panel.tsx
import { useState } from 'react';

interface PanelProps {
  sdk?: {
    exec: {
      run(command: string, args?: Record<string, unknown>): Promise<{ output: string; exitCode: number }>;
    };
  };
  extensionName?: string;
}

export default function MyPanel({ sdk, extensionName }: PanelProps) {
  const [result, setResult] = useState<string | null>(null);

  async function handleRun() {
    if (!sdk) return;
    const res = await sdk.exec.run(`${extensionName}:greet`, { name: 'Alice' });
    setResult(res.output);
  }

  return (
    <div>
      <button onClick={() => void handleRun()}>Run</button>
      {result && <pre>{result}</pre>}
    </div>
  );
}
```

Declare panels in the manifest:

```json
"ui": {
  "panels": [
    { "id": "my-panel", "title": "My Extension", "entry": "ui/panel.js" }
  ]
}
```

Panels share the dashboard's React instance — don't bundle your own React. Use inline styles or CSS modules to avoid style collisions.

### 3. LLM Skills (Agent Assets)

Skills teach LLMs how to use your extension. Place them under `agent/`:

```
agent/
├── skills/{name}/SKILL.md    # skill definitions
├── prompts/{name}.md         # prompt templates
├── context/{name}.md         # reference documents
├── agents/{name}.md          # agent definitions
└── workflows/{name}.md       # workflow scripts
```

Declare them in the manifest:

```json
"agent": {
  "skills": [
    { "name": "greet", "path": "agent/skills/greet/SKILL.md" }
  ],
  "prompts": ["agent/prompts/style.md"],
  "context": ["agent/context/docs.md"]
}
```

Agent assets are deployed to the project's `.agents/` directory when the extension is activated (via the `onInit` lifecycle hook). Each asset is namespaced by extension name to prevent collisions.

## Lifecycle Hooks

The `main` entry point exports named functions that run during activation and deactivation. The CLI injects an enriched `HookContext` containing `extensionDir`, `agentDir`, and SDK functions — so hooks never need to import the SDK at runtime:

```typescript
// src/index.ts
import type { HookContext } from '@renre-kit/extension-sdk/node';

export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}

export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets(context.extensionDir, context.projectDir, context.agentDir);
}
```

The `HookContext` type is a type-only import (erased at compile time), so extensions installed without `node_modules` still work correctly.

| Hook | When | Typical use |
|------|------|-------------|
| `onInit` | Extension activated in a project | Deploy agent assets to `.agents/` |
| `onDestroy` | Extension deactivated from a project | Clean up deployed assets |

Both are optional. If your extension has no agent assets to deploy, you can omit `main` entirely.

## MCP Server Development

MCP extensions run a JSON-RPC server over stdio. The server handles tool calls directly:

```typescript
// src/server.ts
import * as readline from 'node:readline';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

function handleRequest(request: JsonRpcRequest): JsonRpcResponse {
  switch (request.method) {
    case 'echo':
      return { jsonrpc: '2.0', id: request.id, result: request.params };
    case 'ping':
      return { jsonrpc: '2.0', id: request.id, result: 'pong' };
    default:
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
      };
  }
}

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line: string) => {
  try {
    const request = JSON.parse(line) as JsonRpcRequest;
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      error: { code: -32700, message: 'Parse error' },
    }) + '\n');
  }
});
```

The CLI forwards `renre-kit my-mcp-ext:echo "hello"` to the MCP server as a JSON-RPC call with method `echo`. No manifest declarations needed for MCP tools — the server is the source of truth.

You can also add **local commands** alongside MCP tools for utilities that don't need the server:

```json
"commands": {
  "status": {
    "handler": "commands/status.js",
    "description": "Show server status"
  }
}
```

Local commands use file-based handlers (same as standard extensions). MCP tools use pass-through routing. Both coexist under the same extension namespace.

## Engine Version Constraints

The `engines` field declares the minimum CLI and SDK versions your extension requires. Both keys are optional — omit the field entirely if your extension has no version requirements.

```json
"engines": {
  "renre-kit": ">=1.0.0",
  "extension-sdk": ">=1.0.0"
}
```

Constraints use semver range syntax (e.g., `>=1.0.0`, `>=0.5.0`). The CLI checks compatibility at two points:

- **Install/link time** — warnings are shown to the user via the CLI or returned as `compatWarnings` in the dashboard API response
- **Activation time** — warnings are logged but activation still proceeds

Pre-1.0 behavior is **warn-only**: incompatible extensions are not blocked from installing or activating. Post-1.0, mismatched engines will be a hard error.

Scaffolded extensions include `engines` by default with `>=0.0.1` for both keys. Bump these values when your extension depends on features introduced in a specific release.

## Configuration Schema

Extensions can declare configuration fields that users set via `renre-kit ext:config`:

```json
"config": {
  "schema": {
    "apiKey": {
      "type": "string",
      "description": "API key for the service",
      "secret": true,
      "vaultHint": "ext.my-ext.apiKey"
    },
    "maxRetries": {
      "type": "number",
      "description": "Maximum retry attempts",
      "secret": false,
      "default": 3
    }
  }
}
```

Secret fields are stored in the encrypted vault. Non-secret fields are stored as direct values. Configuration is passed to command handlers via `context.config`.

## Development Workflow

### 1. Scaffold

```bash
npx create-renre-extension my-extension
cd my-extension
npm install
```

### 2. Link for development

```bash
renre-kit ext:link .
```

This creates a symlink from `~/.renre-kit/extensions/my-extension@dev` to your working directory. The extension is installed with version `dev` and auto-activated in the current project.

### 3. Build and iterate

```bash
npm run build          # compile TypeScript
# or
npx tsc --watch        # watch mode
```

Since `ext:link` creates a symlink (not a copy), rebuilt files are picked up immediately by the CLI. No need to reinstall.

### 4. Test commands

```bash
renre-kit my-extension:greet Alice
renre-kit my-extension:info
```

### 5. Verify agent assets deployed

```bash
ls .agents/skills/my-extension/
ls .agents/prompts/my-extension/
```

### 6. Start the dashboard to test UI panels

```bash
renre-kit ui
```

Navigate to your extension's panel at `/extensions/my-extension`.

## TypeScript Configuration

Extensions compile TypeScript in-place (no `outDir`). The manifest references `.js` files which `tsc` emits next to the `.ts` source:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src", "commands", "ui"],
  "exclude": ["node_modules"]
}
```

### Required dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "react": "^19.0.0"
  },
  "dependencies": {
    "@renre-kit/extension-sdk": "workspace:*"
  }
}
```

- `@types/node` — for Node.js APIs in commands and hooks
- `react` + `@types/react` — for UI panels (devDependency since dashboard provides React at runtime)
- `@renre-kit/extension-sdk` — for `deployAgentAssets`/`cleanupAgentAssets` in lifecycle hooks

## Publishing

1. Push your extension to a git repository
2. Tag a release: `git tag v1.0.0 && git push --tags`
3. Add an entry to a registry's `extensions.json`:

```json
{
  "my-extension": {
    "name": "my-extension",
    "description": "My awesome extension",
    "gitUrl": "https://github.com/user/my-extension.git",
    "type": "standard",
    "latestVersion": "1.0.0"
  }
}
```

Users install with:

```bash
renre-kit ext:add my-extension
```

## Reference Extensions

One reference extension ships with the repository under `extensions/`:

- **hello-world** — Standard extension with commands, UI panel, lifecycle hooks, and agent assets. Demonstrates all three interaction modes.

Study it as a template for building your own extensions.
