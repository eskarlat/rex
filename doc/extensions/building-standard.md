# Building a Standard Extension

Standard extensions run in-process and are the simplest type to build. This guide walks you through creating one from scratch.

## Scaffold It

The fastest way to start:

```bash
npx create-renre-extension my-awesome-tool
```

This generates:

```
my-awesome-tool/
├── package.json
├── manifest.json
├── tsconfig.json
├── src/
│   └── index.ts          # Lifecycle hooks
├── commands/
│   └── hello.ts          # Command handler
└── agent/
    └── skills/
        └── hello/
            └── SKILL.md  # LLM skill definition
```

## The Manifest

The heart of every extension is `manifest.json`. Here's a complete example:

```json
{
  "name": "my-awesome-tool",
  "version": "1.0.0",
  "description": "Does awesome things",
  "type": "standard",
  "main": "dist/index.js",
  "icon": "icon.svg",
  "iconColor": "#818cf8",
  "engines": {
    "renre-kit": ">= 0.0.1",
    "extension-sdk": ">= 0.0.1"
  },
  "commands": {
    "greet": {
      "handler": "dist/commands/greet.js",
      "description": "Say hello to someone"
    },
    "info": {
      "handler": "dist/commands/info.js",
      "description": "Show extension info"
    }
  },
  "config": {
    "schema": {
      "companyName": {
        "type": "string",
        "description": "Your company name",
        "default": "RenreKit",
        "secret": false
      },
      "apiToken": {
        "type": "string",
        "description": "API authentication token",
        "secret": true,
        "vaultHint": "MY_API_TOKEN"
      }
    }
  },
  "ui": {
    "panels": [
      {
        "id": "main-panel",
        "title": "My Awesome Tool",
        "entry": "dist/panel.js"
      }
    ],
    "widgets": [
      {
        "id": "status-widget",
        "title": "Status",
        "entry": "dist/status-widget.js",
        "defaultSize": { "w": 4, "h": 2 },
        "minSize": { "w": 2, "h": 1 },
        "maxSize": { "w": 6, "h": 4 }
      }
    ]
  },
  "agent": {
    "skills": [
      { "name": "my-skill", "path": "agent/skills/my-skill/SKILL.md" }
    ],
    "prompts": ["agent/prompts/template.prompt.md"],
    "context": ["agent/context/reference.context.md"]
  }
}
```

## Writing Commands

Commands are the primary way users interact with your extension from the terminal. Each command is a function that receives an `ExecutionContext`:

```typescript
// commands/greet.ts

interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface CommandResult {
  output: string;
  exitCode: number;
}

export default function greet(context: ExecutionContext): CommandResult {
  const name = (context.args.name as string) ?? 'World';
  const company = (context.config.companyName as string) ?? 'RenreKit';

  return {
    output: `Hello, ${name}! Welcome from ${company}.`,
    exitCode: 0,
  };
}
```

Users invoke it as:

```bash
renre-kit my-awesome-tool:greet --name "Ada"
# => Hello, Ada! Welcome from RenreKit.
```

The command namespace is the extension name, the subcommand is the key from the `commands` map in the manifest.

## Lifecycle Hooks

Extensions export `onInit` and `onDestroy` from their main entry point:

```typescript
// src/index.ts
import type { HookContext } from '@renre-kit/extension-sdk';

export function onInit(context: HookContext): void {
  // Called when the extension is activated in a project
  // Deploy agent assets (SKILL.md, prompts, context)
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  // Called when the extension is deactivated
  context.sdk.cleanupAgentAssets();
}
```

The `HookContext` gives you:

| Property | Type | Description |
|----------|------|-------------|
| `projectDir` | `string` | Path to the current project |
| `extensionDir` | `string` | Path to the installed extension |
| `agentDir` | `string` | Path to the `.agents/` directory |
| `sdk.deployAgentAssets` | `function` | Deploy SKILL.md and other agent files |
| `sdk.cleanupAgentAssets` | `function` | Remove deployed agent files |

## Adding a UI Panel

Panels are React components that show up in the dashboard. They're bundled with the SDK's `buildPanel` utility.

### 1. Create the component

```tsx
// src/ui/panel.tsx
import React from 'react';

export default function MyPanel() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>My Awesome Tool</h1>
      <p>This panel lives in the RenreKit dashboard.</p>
    </div>
  );
}
```

### 2. Create a build script

```javascript
// build-panel.js
const { buildPanel } = require('@renre-kit/extension-sdk/node');

buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});
```

### 3. Add build scripts to package.json

```json
{
  "scripts": {
    "build": "tsc && node build-panel.js",
    "dev": "tsc --watch"
  }
}
```

### 4. Use SDK components

The extension SDK provides shared shadcn/ui components:

```tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@renre-kit/extension-sdk/components';

export default function StatusWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Everything is running smoothly.</p>
      </CardContent>
    </Card>
  );
}
```

## Development Workflow

### 1. Link your extension locally

```bash
cd my-awesome-tool
npm run build

# Go to a project directory
cd ~/my-project
renre-kit ext:link /path/to/my-awesome-tool
```

### 2. Iterate

Make changes → rebuild → test:

```bash
# In the extension directory
npm run build

# Test your command
renre-kit my-awesome-tool:greet

# Or open the dashboard to see your UI panel
renre-kit ui
```

### 3. Check the health

```bash
renre-kit ext:status my-awesome-tool
```

## Complete Example

The `hello-world` extension in the repo is a fully working reference implementation with:
- 2 commands (greet, info)
- 3 UI panels (main, settings, analytics)
- 1 widget (status)
- Config schema with regular and secret fields
- Agent skills, prompts, and context documents

Check it out at `extensions/hello-world/` in the repo.
