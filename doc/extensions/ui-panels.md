# UI Panels & Widgets

Extensions can contribute visual components to the RenreKit dashboard — full-page **panels** for detailed views and **widgets** for the customizable dashboard grid.

## Panels vs. Widgets

| | Panels | Widgets |
|---|--------|---------|
| **Size** | Full page | Configurable grid item |
| **Where** | Sidebar navigation item | Dashboard grid |
| **Best for** | Detailed views, forms, tables | Quick status, summaries |
| **Navigation** | Dedicated route per panel | All visible on one page |

## Building a Panel

A panel is a React component that's bundled with esbuild and loaded dynamically by the dashboard.

### Step 1: Create the component

```tsx
// src/ui/panel.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@renre-kit/extension-sdk/components';
import { useCommand } from '@renre-kit/extension-sdk';

export default function MyPanel() {
  const { execute, loading, result } = useCommand('my-extension', 'status');

  useEffect(() => {
    execute();
  }, []);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">My Extension</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 2: Register in manifest

```json
{
  "ui": {
    "panels": [
      {
        "id": "my-panel",
        "title": "My Extension",
        "entry": "dist/panel.js"
      }
    ]
  }
}
```

### Step 3: Bundle it

```javascript
// build-panel.js
const { buildPanel } = require('@renre-kit/extension-sdk/node');

buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
  ],
  outdir: 'dist',
});
```

## Building a Widget

Widgets work the same way as panels but live on the dashboard grid. They should be compact and focused.

```tsx
// src/ui/status-widget.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@renre-kit/extension-sdk/components';

export default function StatusWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">My Extension</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-500">Active</div>
        <p className="text-xs text-muted-foreground">Last checked: just now</p>
      </CardContent>
    </Card>
  );
}
```

Register it in the manifest with size constraints:

```json
{
  "ui": {
    "widgets": [
      {
        "id": "status-widget",
        "title": "Status",
        "entry": "dist/status-widget.js",
        "defaultSize": { "w": 3, "h": 2 },
        "minSize": { "w": 2, "h": 1 },
        "maxSize": { "w": 6, "h": 4 }
      }
    ]
  }
}
```

## Widget Grid System

The dashboard uses a 12-column grid:

```
┌──1──┬──2──┬──3──┬──4──┬──5──┬──6──┬──7──┬──8──┬──9──┬──10─┬──11─┬──12─┐
│                                                                         │
│  w: 4, h: 2                    │  w: 4, h: 2          │  w: 4, h: 2    │
│                                │                      │                 │
├────────────────────────────────┴──────────────────────┴─────────────────┤
│                                                                         │
│  w: 12, h: 1  (full-width widget)                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Width**: 1–12 columns
- **Height**: 1+ rows (each row ≈ 100px)
- Users can drag and drop to rearrange
- Users can resize within the min/max constraints

## Available SDK Hooks

The extension SDK provides React hooks for interacting with the RenreKit system:

### `useCommand`

Execute extension commands:

```tsx
import { useCommand } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { execute, loading, result, error } = useCommand('my-extension', 'status');

  return (
    <button onClick={() => execute()} disabled={loading}>
      {loading ? 'Loading...' : 'Check Status'}
    </button>
  );
}
```

### `useStorage`

Read and write extension-scoped storage:

```tsx
import { useStorage } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { data, set, remove, loading } = useStorage('my-extension');

  return (
    <div>
      <p>Stored value: {data?.myKey}</p>
      <button onClick={() => set('myKey', 'myValue')}>Save</button>
    </div>
  );
}
```

### `useEvents`

Subscribe to real-time events:

```tsx
import { useEvents } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { lastEvent } = useEvents('my-extension:status-changed');

  return <p>Latest event: {JSON.stringify(lastEvent)}</p>;
}
```

### `useScheduler`

Register and manage scheduled tasks:

```tsx
import { useScheduler } from '@renre-kit/extension-sdk';

function MyComponent() {
  const { tasks, register, trigger } = useScheduler();

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.name}
          <button onClick={() => trigger(task.id)}>Run Now</button>
        </li>
      ))}
    </ul>
  );
}
```

## Available SDK Components

The SDK re-exports shadcn/ui components for a consistent look and feel:

```tsx
import {
  // Layout
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Separator,
  ScrollArea,

  // Forms
  Button,
  Input,
  Label,
  Checkbox,
  Switch,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,

  // Feedback
  Alert, AlertTitle, AlertDescription,
  Badge,
  Skeleton,
  Spinner,
  ProgressBar,
  Toast,
  Tooltip,

  // Data
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DataTable,
  CodeBlock,
  LogViewer,

  // Navigation
  SidebarNav,
  SearchBar,

  // Overlays
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  Modal,
  FormField,
  EmptyState,
  Split,
} from '@renre-kit/extension-sdk/components';
```

::: tip Consistent UI
Always use SDK components instead of building your own. This ensures your extension panels and widgets look native in the dashboard, with proper theming and accessibility.
:::
