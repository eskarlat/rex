# Browser Extension Plan

## Overview

A new RenreKit extension called **`agent-browser`** that wraps the [`agent-browser`](https://agent-browser.dev) CLI tool (by Vercel Labs). It provides a **single panel** that looks and behaves like a real browser window — tab bar, URL bar, and a live interactive viewport streamed from headless Chrome via CDP WebSocket.

Users can interact with the page directly in the viewport (click, scroll, type), toggle **Dev Mode** (element inspector), and watch AI agents operate the browser in real-time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Panel (React)                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [favicon] Tab 1  ×  │  [favicon] Tab 2  ×  │  [+]   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  ◀  ▶  ↻  │ 🔒 https://example.com           │  ⚙   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │              LIVE VIEWPORT                            │  │
│  │        (CDP Page.screencastFrame → <canvas>)          │  │
│  │        + mouse/keyboard events → CDP Input.*          │  │
│  │                                                       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ● Connected │ 1280×720 │ [Dev Mode] │ Session: default│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                    ▲
         │ Input.dispatchMouseEvent           │ Page.screencastFrame
         │ Input.dispatchKeyEvent             │ DOM.getDocument (dev mode)
         ▼                                    │
    ┌─────────────────────────────────────────────┐
    │  agent-browser daemon (headless Chrome)      │
    │  CDP WebSocket: ws://localhost:9222/...       │
    └─────────────────────────────────────────────┘
```

### Why Direct CDP (not polling screenshots)?

- **Real-time**: `Page.startScreencast` pushes JPEG frames at configurable FPS, ~50-100KB each
- **Interactive**: `Input.dispatchMouseEvent` / `Input.dispatchKeyEvent` over same WebSocket
- **Efficient**: No repeated `screenshot` command overhead; frames arrive only when content changes
- **Dev Mode**: `DOM.getDocument` + `DOM.highlightNode` for element inspection over same connection

---

## Extension Structure

```
extensions/agent-browser/
├── manifest.json
├── package.json
├── icon.svg
├── build.js
├── tsconfig.json
├── tsconfig.lint.json
├── eslint.config.mjs
├── src/
│   ├── index.ts                          # onInit/onDestroy lifecycle
│   ├── commands/
│   │   ├── open.ts                       # Open URL in browser
│   │   ├── close.ts                      # Close browser session
│   │   ├── status.ts                     # Browser status + CDP URL
│   │   ├── click.ts                      # Click element by ref
│   │   ├── type.ts                       # Type into element
│   │   ├── screenshot.ts                 # Take screenshot
│   │   ├── snapshot.ts                   # Accessibility tree snapshot
│   │   ├── tabs.ts                       # List open tabs
│   │   ├── navigate.ts                   # Navigate to URL
│   │   └── eval.ts                       # Execute JavaScript
│   └── ui/
│       ├── panel.tsx                      # Main panel entry point
│       ├── components/
│       │   ├── BrowserChrome.tsx          # Full browser window wrapper
│       │   ├── TabBar.tsx                 # Tab bar with management
│       │   ├── AddressBar.tsx            # URL bar + nav buttons
│       │   ├── Viewport.tsx              # Canvas-based live viewport
│       │   ├── StatusBar.tsx             # Bottom status strip
│       │   ├── DevToolsOverlay.tsx       # Element inspector overlay
│       │   └── EmptyState.tsx            # Not-connected state
│       ├── hooks/
│       │   ├── useCdpConnection.ts       # WebSocket lifecycle to CDP
│       │   ├── useScreencast.ts          # Frame rendering on canvas
│       │   ├── useInputForwarding.ts     # Mouse/keyboard → CDP Input.*
│       │   ├── useDevMode.ts             # DOM inspection overlay
│       │   ├── useBrowserStatus.ts       # Polling browser status
│       │   └── useTabManager.ts          # Tab state from CDP
│       └── lib/
│           ├── cdp-client.ts             # Thin CDP WebSocket wrapper
│           └── input-mapper.ts           # DOM events → CDP protocol
├── agent/
│   └── skills/
│       └── browser-automation/
│           └── SKILL.md
└── dist/
```

---

## Panel Design — "Browser-in-Browser"

A single panel that renders a complete browser window chrome using the dashboard's design system (shadcn/ui tokens, muted backgrounds, subtle borders).

### 1. Tab Bar

```
┌──────────────────────────────────────────────────────────────┐
│  [●] Example.com  ×  │  [●] GitHub  ×  │  [+]               │
└──────────────────────────────────────────────────────────────┘
```

- Horizontal scrollable tabs
- Active tab: `bg-background border-b-0 rounded-t-md`, inactive: `bg-muted/50 text-muted-foreground`
- Close per tab (×), new tab (+)
- Favicon dot (colored circle derived from domain)
- Tab data from `Target.getTargets()` via CDP

### 2. Address Bar

```
┌──────────────────────────────────────────────────────────────┐
│  ◀  ▶  ↻  │  🔒 https://example.com/page          │  ⚙    │
└──────────────────────────────────────────────────────────────┘
```

- Nav buttons: `Button variant="ghost" size="icon"` with Lucide icons (`ChevronLeft`, `ChevronRight`, `RotateCw`)
- Lock icon (`Lock`/`Unlock`) for HTTPS/HTTP
- URL `Input` — editable, Enter navigates
- Settings gear (`Settings2`): dropdown with viewport preset selector

### 3. Viewport — The Core

- `<canvas>` element filling available panel height
- Two-layer approach: bottom canvas for screencast, top canvas (absolute positioned) for dev mode overlay
- Renders JPEG frames from `Page.screencastFrame`
- `tabIndex={0}` to capture keyboard focus
- Mouse events: click, move, scroll → scaled to viewport coords → `Input.dispatchMouseEvent`
- Keyboard events → `Input.dispatchKeyEvent`
- Loading spinner overlay when connecting

### 4. Status Bar

```
┌──────────────────────────────────────────────────────────────┐
│ ● Connected │ 1280 × 720 │ [Dev Mode] │ Session: default    │
└──────────────────────────────────────────────────────────────┘
```

- Status dot: green `bg-emerald-500` (connected), yellow `bg-yellow-500` (connecting), red `bg-destructive` (disconnected)
- Viewport dimensions: `text-muted-foreground text-xs`
- Dev Mode toggle: `Button variant="outline" size="sm"` → `variant="default"` when active
- Session name: `Badge variant="secondary"`

### 5. Dev Mode Overlay

When toggled on:
- Hover highlights elements with blue border overlay (drawn on overlay canvas)
- Uses `Overlay.setInspectMode({ mode: 'searchForNode' })` via CDP
- On element click, shows info card positioned near selection:

```
┌─────────────────────────────┐
│ div.container > p.title     │
│ 320 × 48                   │
│ font-size: 16px             │
│ color: rgb(51, 51, 51)      │
│ [Copy selector]             │
└─────────────────────────────┘
```

- Card component: `Card` with `CardContent`, small text, `text-xs font-mono`
- Exit: click toggle or press Escape
- Uses `DOM.describeNode` + `CSS.getComputedStyleForNode` for element details

### 6. Empty State (No Browser Running)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                       Globe icon                             │
│                  No browser session                          │
│                                                              │
│          Enter a URL to launch a headless browser            │
│                                                              │
│     [ https://                                ] [Launch]     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- `EmptyState` component from SDK, or custom with `Globe` Lucide icon
- URL `Input` + `Button` to launch
- On launch: `sdk.exec.run('agent-browser:open', { url })` → transitions to live view

---

## Commands (CLI Layer)

All commands wrap `agent-browser` CLI via `child_process.execFile` and parse text output to structured JSON.

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `open` | `url: string` | `agent-browser open <url>` | `{ url, title }` |
| `close` | — | `agent-browser close` | `{ closed: true }` |
| `status` | — | `agent-browser get cdp-url` | `{ connected, cdpUrl, url, title, session }` |
| `click` | `ref: string` | `agent-browser click <ref>` | `{ clicked: true }` |
| `type` | `ref: string, text: string` | `agent-browser type <ref> <text>` | `{ typed: true }` |
| `screenshot` | `path?: string` | `agent-browser screenshot` | `{ path, dataUrl }` |
| `snapshot` | — | `agent-browser snapshot` | `{ tree: string }` |
| `tabs` | — | `agent-browser tabs` | `{ tabs: Tab[] }` |
| `navigate` | `url: string` | `agent-browser open <url>` | `{ url, title }` |
| `eval` | `code: string` | `agent-browser eval <code>` | `{ result }` |

Each command uses `defineCommand()` with Zod schemas:

```typescript
import { z, defineCommand } from '@renre-kit/extension-sdk/node';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default defineCommand({
  args: { url: z.string() },
  handler: async (ctx) => {
    const { stdout } = await execFileAsync('agent-browser', ['open', ctx.args.url]);
    return { output: stdout.trim(), exitCode: 0 };
  },
});
```

---

## CDP WebSocket Integration

### Connection Flow (in panel)

1. Panel mounts → `useBrowserStatus` polls `sdk.exec.run('agent-browser:status')` every 3s
2. When `status.connected && status.cdpUrl` → `useCdpConnection` opens WebSocket
3. `useScreencast` sends `Page.startScreencast` → receives frames → draws on canvas
4. `useInputForwarding` captures DOM events on canvas → sends CDP input events
5. `useTabManager` listens to `Target.targetCreated/destroyed/infoChanged`

### CDP Client (`cdp-client.ts`)

```typescript
class CdpClient {
  private ws: WebSocket;
  private nextId = 1;
  private pending = new Map<number, { resolve, reject }>();
  private listeners = new Map<string, Set<Function>>();

  send(method: string, params?: object): Promise<unknown>;
  on(event: string, handler: (params: unknown) => void): () => void;
  close(): void;
}
```

### Screencast Flow (`useScreencast.ts`)

```typescript
cdp.send('Page.startScreencast', {
  format: 'jpeg',
  quality: 80,
  maxWidth: 1280,
  maxHeight: 720,
});

cdp.on('Page.screencastFrame', (params) => {
  const img = new Image();
  img.onload = () => {
    canvasCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId });
  };
  img.src = `data:image/jpeg;base64,${params.data}`;
});
```

### Input Forwarding (`useInputForwarding.ts`)

```typescript
// Mouse events
canvas.addEventListener('mousedown', (e) => {
  const { x, y } = scaleToViewport(e, canvas, viewportSize);
  cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x, y,
    button: 'left', clickCount: 1,
  });
});

// Keyboard events
canvas.addEventListener('keydown', (e) => {
  cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: e.key,
    code: e.code,
    windowsVirtualKeyCode: e.keyCode,
    modifiers: getModifiers(e),
  });
});

// Scroll
canvas.addEventListener('wheel', (e) => {
  const { x, y } = scaleToViewport(e, canvas, viewportSize);
  cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel', x, y,
    deltaX: e.deltaX, deltaY: e.deltaY,
  });
});
```

### Coordinate Scaling

```typescript
function scaleToViewport(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  viewport: { width: number; height: number }
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = viewport.width / rect.width;
  const scaleY = viewport.height / rect.height;
  return {
    x: Math.round((event.clientX - rect.left) * scaleX),
    y: Math.round((event.clientY - rect.top) * scaleY),
  };
}
```

---

## Config Schema

```json
{
  "schema": {
    "session": {
      "type": "string",
      "description": "Default browser session name",
      "secret": false,
      "default": "default"
    },
    "viewport": {
      "type": "string",
      "description": "Default viewport size (WxH)",
      "secret": false,
      "default": "1280x720"
    }
  }
}
```

---

## Implementation Steps

### Step 1: Scaffold extension
- Create `extensions/agent-browser/` directory
- `manifest.json` — 10 commands, 1 panel, config schema, agent skill
- `package.json` — `@renre-kit/extension-sdk` dependency
- `build.js` — `buildExtension` (10 commands + index) + `buildPanel` (1 panel)
- `tsconfig.json`, `tsconfig.lint.json`, `eslint.config.mjs`
- `icon.svg` — globe/browser icon

### Step 2: CLI commands (10 commands)
- `open`, `close`, `status`, `click`, `type`, `screenshot`, `snapshot`, `tabs`, `navigate`, `eval`
- Each wraps `agent-browser` CLI via `execFile`
- `status` returns `{ connected, cdpUrl, url, title, session }` — key for panel

### Step 3: Lifecycle hooks (`index.ts`)
- `onInit`: check `agent-browser --version`, deploy agent assets
- `onDestroy`: cleanup agent assets

### Step 4: CDP client library (`ui/lib/cdp-client.ts`)
- WebSocket wrapper with request/response ID tracking
- Methods: `send()`, `on()`, `close()`
- Auto-reconnect (3 retries, exponential backoff)

### Step 5: Input mapper (`ui/lib/input-mapper.ts`)
- `scaleToViewport()` — canvas coords → viewport coords
- `getModifiers()` — extract ctrl/shift/alt/meta from keyboard events
- `mapMouseEvent()` — DOM MouseEvent → CDP Input.dispatchMouseEvent params
- `mapKeyEvent()` — DOM KeyboardEvent → CDP Input.dispatchKeyEvent params
- `mapWheelEvent()` — DOM WheelEvent → CDP mouseWheel params

### Step 6: React hooks
- `useBrowserStatus` — polls `status` command every 3s
- `useCdpConnection` — manages WebSocket lifecycle to CDP URL
- `useScreencast` — starts screencast, renders frames to canvas ref
- `useInputForwarding` — attaches mouse/keyboard listeners to canvas
- `useTabManager` — subscribes to CDP Target events, maintains tab list
- `useDevMode` — toggles CDP Overlay inspect mode, captures selected element

### Step 7: Panel components
- `EmptyState` — URL input + Launch button (when no browser running)
- `TabBar` — renders tabs, handles switching
- `AddressBar` — URL display/input, back/forward/reload
- `Viewport` — dual-canvas (screencast + overlay), focus management
- `StatusBar` — connection status, viewport size, dev mode toggle, session badge
- `DevToolsOverlay` — element info card on selection
- `BrowserChrome` — composites all above into the browser window

### Step 8: Main panel entry (`panel.tsx`)
- Conditionally renders `EmptyState` or `BrowserChrome` based on status
- Manages top-level state (cdpUrl, connected, devMode)

### Step 9: Agent skill (`SKILL.md`)
- Browser automation skill with all command references
- Example workflows

### Step 10: Build & validate
- `node build.js` — verify all entry points compile
- Manual testing against dashboard

---

## Key Design Decisions

1. **Single panel** — Everything in one browser-like window. No separate panels for screenshots/logs.

2. **Direct CDP over WebSocket** — `Page.startScreencast` gives near-real-time video. Falls back to screenshot polling if CDP WS unreachable.

3. **Canvas rendering** — Can't iframe headless Chrome. Canvas gives full control over rendering + input. Two layers (viewport + dev overlay) for clean separation.

4. **Commands wrap agent-browser CLI** — Reuses daemon lifecycle, session persistence, Chrome management. We don't manage Chrome directly.

5. **CDP from panel JS** — Panel connects directly to Chrome's CDP WebSocket on localhost. No server proxy needed.

6. **Dashboard design system** — Uses `bg-muted`, `border`, `text-muted-foreground`, `rounded-md`, shadcn/ui `Button`, `Input`, `Card`, `Badge` etc. The browser chrome feels native to the dashboard.
