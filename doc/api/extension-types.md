# TypeScript Types

Key TypeScript types and interfaces used across the RenreKit ecosystem. Useful when building extensions or integrating with the system.

## Extension Types

### ExtensionManifest

The complete manifest structure:

```typescript
export type ExtensionType = 'standard' | 'mcp';

export interface ExtensionManifest {
  name: string;
  title?: string;
  version: string;
  description: string;
  icon?: string;
  iconColor?: string;
  type: ExtensionType;
  main?: string;
  engines: EngineConstraints;
  commands: Record<string, ExtensionCommand>;
  mcp?: McpConfig;
  config?: { schema: Record<string, ConfigSchemaField> };
  ui?: {
    panels: UiPanel[];
    widgets: UiWidget[];
  };
  agent?: AgentAssets;
}
```

### EngineConstraints

```typescript
export interface EngineConstraints {
  'renre-kit': string;       // semver range, e.g., ">= 1.0.0"
  'extension-sdk': string;   // semver range
}
```

### ExtensionCommand

```typescript
export interface ExtensionCommand {
  handler: string;           // path to compiled handler file
  description: string;
}
```

## MCP Types

### McpConfig

```typescript
export interface McpConfig {
  transport: 'stdio' | 'sse';

  // stdio transport
  command?: string;
  args?: string[];
  env?: Record<string, string>;

  // SSE transport
  url?: string;
  headers?: Record<string, string>;
}
```

## Config Types

### ConfigSchemaField

```typescript
export interface ConfigSchemaField {
  type: 'string' | 'number' | 'boolean';
  description: string;
  secret: boolean;
  vaultHint?: string;
  default?: string | number | boolean;
}
```

## UI Types

### UiPanel

```typescript
export interface UiPanel {
  id: string;
  title: string;
  entry: string;     // path to bundled JS file
}
```

### UiWidget

```typescript
export interface UiWidget {
  id: string;
  title: string;
  entry: string;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
}

export interface WidgetSize {
  w: number;   // grid columns (1-12)
  h: number;   // grid rows (1+, ~100px each)
}
```

## Agent Types

### AgentAssets

```typescript
export interface AgentAssets {
  skills?: SkillRef[];
  prompts?: string[];
  context?: string[];
  hooks?: string[];
  agents?: string[];
  workflows?: string[];
}

export interface SkillRef {
  name: string;
  path: string;
}
```

## Command Execution Types

### defineCommand

The recommended way to define extension commands. Imported from `@renre-kit/extension-sdk/node`:

```typescript
import { z, defineCommand } from '@renre-kit/extension-sdk/node';

// With typed args
export default defineCommand({
  args: {
    selector: z.string({ required_error: '--selector is required' }).min(1),
    timeout: z.number().default(5000),
  },
  handler: async (ctx) => {
    ctx.args.selector; // string (typed)
    ctx.args.timeout;  // number (defaults to 5000)
    return { output: '...', exitCode: 0 };
  },
});

// Without args — context parameter can be omitted entirely
export default defineCommand({
  handler: () => {
    return { output: '...', exitCode: 0 };
  },
});
```

### TypedContext

The handler receives a `TypedContext<TArgs>` with args inferred from the Zod schema:

```typescript
type TypedContext<TArgs> = Omit<ExecutionContext, 'args'> & { args: TArgs };
```

### ExecutionContext

The base context interface (used internally, `TypedContext` wraps it):

```typescript
export interface ExecutionContext {
  projectName: string;
  projectPath: string;
  args: Record<string, unknown>;
  config: Record<string, unknown>;
}
```

### CommandResult

Returned by command handlers:

```typescript
export interface CommandResult {
  output: string;
  exitCode: number;
}
```

### Argument Validation

When `defineCommand` is called with an `args` object, the CLI automatically:
- Validates args before the handler runs
- Applies schema defaults (e.g., `z.number().default(5000)`)
- Throws `ARGS_VALIDATION_FAILED` with formatted error messages on invalid input
- Provides fully typed `ctx.args` — no manual casting needed

When `args` is omitted, args are passed through unchanged on `ctx.args`.

This works for both standard extensions and MCP extensions with custom local command handlers.

> **Legacy pattern**: Bare default export function + separate `export const argsSchema` still works for backward compatibility.

## Lifecycle Types

### HookContext

Passed to `onInit` and `onDestroy`:

```typescript
export interface SdkLogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export interface SdkMethods {
  deployAgentAssets: () => void;
  cleanupAgentAssets: () => void;
  logger: SdkLogger;
}

export interface HookContext {
  projectDir: string;
  extensionDir: string;
  agentDir: string;
  sdk: SdkMethods;
}
```

## Database Types

### Project

```typescript
export interface Project {
  id: number;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
}
```

### InstalledExtension

```typescript
export interface InstalledExtension {
  id: number;
  name: string;
  version: string;
  path: string;
  registry: string | null;
  installed_at: string;
}
```

### ScheduledTask

```typescript
export interface ScheduledTask {
  id: number;
  project_path: string;
  extension: string;
  task_id: string;
  name: string;
  cron: string;
  handler: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
}
```

### TaskHistoryEntry

```typescript
export interface TaskHistoryEntry {
  id: number;
  task_id: number;
  status: 'success' | 'failure';
  output: string | null;
  started_at: string;
  ended_at: string | null;
  duration: number | null;
}
```
