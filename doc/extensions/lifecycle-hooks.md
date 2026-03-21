# Lifecycle Hooks

Extensions can hook into activation and deactivation events to run setup and teardown logic. This is how agent assets get deployed, scheduled tasks get registered, and any other initialization happens.

## The Two Hooks

Extensions export two named functions from their `main` entry point:

```typescript
// src/index.ts
import type { HookContext } from '@renre-kit/extension-sdk';

export function onInit(context: HookContext): void {
  // Called when the extension is activated in a project
}

export function onDestroy(context: HookContext): void {
  // Called when the extension is deactivated
}
```

Both are optional — only export what you need.

## When They're Called

| Event | Hook | Typical use |
|-------|------|-------------|
| `ext:activate` | `onInit` | Deploy agent assets, register tasks |
| `ext:deactivate` | `onDestroy` | Clean up agent assets, unregister tasks |
| `ext:update` | `onDestroy` then `onInit` | Old version teardown, new version setup |

## The HookContext

The context object gives you everything you need:

```typescript
interface HookContext {
  projectDir: string;      // e.g., /Users/me/my-project
  extensionDir: string;    // e.g., ~/.renre-kit/extensions/my-ext@1.0.0
  agentDir: string;        // e.g., /Users/me/my-project/.agents
  sdk: {
    deployAgentAssets: () => void;
    cleanupAgentAssets: () => void;
    logger: SdkLogger;
  };
}
```

The SDK methods already know the paths from the context — no need to pass them again.

::: tip Why `context.sdk.*`?
The SDK methods are injected into the context by the CLI with the paths already bound. Extensions don't need `node_modules` or direct SDK imports — just call the methods and they do the right thing.
:::

## Common Patterns

### Deploying Agent Assets

The most common use of lifecycle hooks:

```typescript
export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets();
}

export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets();
}
```

This copies SKILL.md files, prompts, and context documents from the extension's `agent/` directory to the project's `.agents/` directory.

### Custom Setup Logic

You can add any initialization code:

```typescript
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function onInit(context: HookContext): void {
  // Deploy agent assets
  context.sdk.deployAgentAssets();

  // Create extension-specific storage directory
  const storageDir = join(context.projectDir, '.renre-kit', 'storage', 'my-extension');
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  // Any other setup...
  console.log('My extension is ready!');
}
```

### Cleanup

Always clean up what you create:

```typescript
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function onDestroy(context: HookContext): void {
  // Clean up agent assets
  context.sdk.cleanupAgentAssets();

  // Remove extension-specific storage
  const storageDir = join(context.projectDir, '.renre-kit', 'storage', 'my-extension');
  if (existsSync(storageDir)) {
    rmSync(storageDir, { recursive: true });
  }
}
```

## Error Handling

If a lifecycle hook throws, RenreKit catches the error and logs it but continues with the activation/deactivation. Your hook should handle its own errors gracefully:

```typescript
export function onInit(context: HookContext): void {
  try {
    context.sdk.deployAgentAssets();
  } catch (error) {
    // Log but don't crash — the extension can still work without agent assets
    console.warn('Failed to deploy agent assets:', error);
  }
}
```
