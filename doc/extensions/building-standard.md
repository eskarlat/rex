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

Commands are the primary way users interact with your extension from the terminal. Use `defineCommand()` from `@renre-kit/extension-sdk/node` to define commands with typed args and validation:

```typescript
// commands/greet.ts
import { z, defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  args: {
    name: z.string().default('World'),
  },
  handler: (ctx) => {
    const company = (ctx.config.companyName as string) ?? 'RenreKit';
    return {
      output: `Hello, ${ctx.args.name}! Welcome from ${company}.`,
      exitCode: 0,
    };
  },
});
```

Users invoke it as:

```bash
renre-kit my-awesome-tool:greet --name "Ada"
# => Hello, Ada! Welcome from RenreKit.
```

The command namespace is the extension name, the subcommand is the key from the `commands` map in the manifest.

Commands that don't need args or context can omit the parameter entirely:

```typescript
// commands/status.ts
import { defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  handler: () => {
    return { output: 'All systems go', exitCode: 0 };
  },
});
```

### Argument Validation with Zod

Define an `args` object in `defineCommand` with Zod schemas for automatic validation. The CLI validates args before your handler runs and provides fully typed `ctx.args`:

```typescript
// commands/greet.ts
import { z, defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  args: {
    name: z.string({ required_error: '--name is required' }).min(1),
    loud: z.boolean().default(false),
  },
  handler: (ctx) => {
    // ctx.args.name is typed as string, guaranteed non-empty
    // ctx.args.loud is typed as boolean, defaults to false
    const greeting = `Hello, ${ctx.args.name}!`;
    return {
      output: ctx.args.loud ? greeting.toUpperCase() : greeting,
      exitCode: 0,
    };
  },
});
```

When `args` is provided:
- The CLI validates args against the schema before calling your handler
- Schema defaults are applied (e.g., `z.boolean().default(false)`)
- Invalid args produce a consistent error: `Invalid arguments: --name: --name is required`
- `ctx.args` is fully typed — no manual casting needed

When `args` is omitted, args are passed through unchanged on `ctx.args`.

> **Legacy pattern**: Bare default export function + separate `export const argsSchema` still works for backward compatibility.

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
