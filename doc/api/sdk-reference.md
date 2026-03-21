# Extension SDK Reference

The `@renre-kit/extension-sdk` package provides everything extension authors need to build UI panels, interact with the RenreKit system, and share components.

## Installation

```bash
npm install @renre-kit/extension-sdk
```

## Export Paths

The SDK has three entry points:

| Import | Contents |
|--------|----------|
| `@renre-kit/extension-sdk` | API client, React hooks |
| `@renre-kit/extension-sdk/components` | Shared shadcn/ui components |
| `@renre-kit/extension-sdk/node` | Node.js utilities (build, deploy) |

---

## React Hooks

### `useCommand(extensionName, commandName)`

Execute an extension command and track its state.

```typescript
import { useCommand } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { execute, loading, result, error } = useCommand('my-ext', 'status');

  return (
    <div>
      <button onClick={() => execute()} disabled={loading}>
        Check Status
      </button>
      {error && <p className="text-red-500">{error.message}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `execute` | `(args?: Record<string, unknown>) => Promise<void>` | Run the command |
| `loading` | `boolean` | Whether the command is running |
| `result` | `CommandResult \| null` | The command's output |
| `error` | `Error \| null` | Error if the command failed |

### `useStorage(extensionName)`

Read and write extension-scoped key/value storage.

```typescript
import { useStorage } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { data, set, remove, loading } = useStorage('my-ext');

  return (
    <div>
      <p>Value: {data?.myKey}</p>
      <button onClick={() => set('myKey', 'newValue')}>Update</button>
      <button onClick={() => remove('myKey')}>Delete</button>
    </div>
  );
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Record<string, unknown> \| null` | All stored key/values |
| `set` | `(key: string, value: unknown) => Promise<void>` | Set a value |
| `remove` | `(key: string) => Promise<void>` | Remove a value |
| `loading` | `boolean` | Whether a storage operation is in progress |

### `useEvents(eventPattern)`

Subscribe to real-time events via WebSocket.

```typescript
import { useEvents } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { lastEvent, events } = useEvents('my-ext:status-changed');

  return (
    <div>
      <p>Last event: {JSON.stringify(lastEvent)}</p>
      <p>Total events received: {events.length}</p>
    </div>
  );
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `lastEvent` | `unknown \| null` | Most recent event payload |
| `events` | `unknown[]` | All received events |

### `useScheduler()`

Manage scheduled tasks for the current extension.

```typescript
import { useScheduler } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { tasks, register, trigger, remove } = useScheduler();

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.name} ({task.cron})
          <button onClick={() => trigger(task.id)}>Run Now</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## API Client

For custom API calls beyond what hooks provide:

```typescript
import { ApiClient } from '@renre-kit/extension-sdk';

const client = new ApiClient();
// or with options:
// const client = new ApiClient({ baseUrl: 'http://localhost:8080', projectPath: '/my/project' });

// Project
const project = await client.getProject();

// Commands
const result = await client.runCommand('my-ext:hello', { name: 'World' });

// Storage
const entries = await client.listStorage('my-ext');
const value = await client.getStorageValue('my-ext', 'key');
await client.setStorage('my-ext', 'key', 'value');
await client.deleteStorage('my-ext', 'key');

// Scheduler
const tasks = await client.getScheduledTasks();
const task = await client.createTask({ extension_name: 'my-ext', cron: '0 * * * *', command: 'sync' });
await client.updateTask('task-id', { enabled: 0 });
await client.deleteTask('task-id');

// Logging
await client.writeLog('info', 'my-ext', 'Something happened');
```

---

## Node.js Utilities

These are for build-time and lifecycle operations. Import from `@renre-kit/extension-sdk/node`.

### `buildPanel(options)`

Bundle React panels with esbuild:

```javascript
const { buildPanel } = require('@renre-kit/extension-sdk/node');

buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/status-widget.tsx', out: 'status-widget' },
  ],
  outdir: 'dist',
});
```

### `context.sdk.deployAgentAssets()`

Deploy agent assets from the extension to the project's `.agents/` directory. Called inside lifecycle hooks — the paths are already bound from the context:

```typescript
export function onInit(context: HookContext): void {
  context.sdk.deployAgentAssets();
}
```

### `context.sdk.cleanupAgentAssets()`

Remove previously deployed agent assets:

```typescript
export function onDestroy(context: HookContext): void {
  context.sdk.cleanupAgentAssets();
}
```

---

## Components

The SDK re-exports a full set of shadcn/ui components. Import from `@renre-kit/extension-sdk/components`:

### Layout

```tsx
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Separator,
  ScrollArea,
  Split,
} from '@renre-kit/extension-sdk/components';
```

### Forms

```tsx
import {
  Button,
  Input,
  Label,
  Checkbox,
  Switch,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  FormField,
} from '@renre-kit/extension-sdk/components';
```

### Data Display

```tsx
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DataTable,
  CodeBlock,
  LogViewer,
  Badge,
} from '@renre-kit/extension-sdk/components';
```

### Feedback

```tsx
import {
  Alert, AlertTitle, AlertDescription,
  Skeleton,
  Spinner,
  ProgressBar,
  Toast,
  Tooltip,
} from '@renre-kit/extension-sdk/components';
```

### Navigation & Search

```tsx
import {
  SidebarNav,
  SearchBar,
} from '@renre-kit/extension-sdk/components';
```

### Overlays

```tsx
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  Modal,
  EmptyState,
} from '@renre-kit/extension-sdk/components';
```
