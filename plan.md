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
│  │  ◀  ▶  ↻  │ 🔒 https://example.com      │  ⚙  [Dev ◉]  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │              LIVE VIEWPORT                            │  │
│  │        (CDP Page.screencastFrame → <canvas>)          │  │
│  │        + mouse/keyboard events → CDP Input.*          │  │
│  │                                                       │  │
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
│   │   ├── # Core Navigation (6)
│   │   ├── open.ts                       # Open URL in browser
│   │   ├── close.ts                      # Close browser session
│   │   ├── status.ts                     # Browser status + CDP URL
│   │   ├── back.ts                       # Navigate back
│   │   ├── forward.ts                    # Navigate forward
│   │   ├── reload.ts                     # Reload page
│   │   ├── # Interaction (7)
│   │   ├── click.ts                      # Click element by ref
│   │   ├── type.ts                       # Type into element
│   │   ├── fill.ts                       # Clear and fill element
│   │   ├── select.ts                     # Select dropdown option
│   │   ├── hover.ts                      # Hover over element
│   │   ├── scroll.ts                     # Scroll direction/pixels
│   │   ├── wait.ts                       # Wait for selector or ms
│   │   ├── # Capture & Extraction (7)
│   │   ├── screenshot.ts                 # Take screenshot
│   │   ├── snapshot.ts                   # Accessibility tree snapshot
│   │   ├── eval.ts                       # Execute JavaScript
│   │   ├── get-text.ts                   # Extract visible text
│   │   ├── get-html.ts                   # Extract HTML content
│   │   ├── get-url.ts                    # Get current page URL
│   │   ├── pdf.ts                        # Export page as PDF
│   │   ├── # Find Elements (3)
│   │   ├── find-role.ts                  # Find by ARIA role
│   │   ├── find-text.ts                  # Find by text content
│   │   ├── find-label.ts                 # Find by label
│   │   ├── # Tabs & Cookies (3)
│   │   ├── tabs.ts                       # List open tabs
│   │   ├── cookies-get.ts                # Get cookies
│   │   ├── cookies-set.ts                # Set cookies
│   │   ├── # Debug & Inspect (8)
│   │   ├── console.ts                    # View console logs
│   │   ├── errors.ts                     # View page errors
│   │   ├── network.ts                    # View network requests
│   │   ├── highlight.ts                  # Highlight element
│   │   ├── trace-start.ts               # Start Chrome trace
│   │   ├── trace-stop.ts                # Stop trace, save file
│   │   ├── diff-snapshot.ts             # Compare accessibility snapshots
│   │   └── diff-screenshot.ts           # Compare screenshots visually
│   └── ui/
│       ├── panel.tsx                      # Main panel entry point
│       ├── components/
│       │   ├── BrowserChrome.tsx          # Full browser window wrapper
│       │   ├── TabBar.tsx                 # Tab bar with management
│       │   ├── AddressBar.tsx            # URL bar + nav buttons
│       │   ├── Viewport.tsx              # Canvas-based live viewport
│       │   ├── DevToolsOverlay.tsx       # Element inspector overlay
│       │   ├── DebugDrawer.tsx          # Bottom debug panel container
│       │   ├── ConsolePanel.tsx         # Console log viewer
│       │   ├── NetworkPanel.tsx         # Network request list
│       │   ├── ErrorsPanel.tsx          # Page errors viewer
│       │   ├── ElementsPanel.tsx        # Element inspector details
│       │   └── EmptyState.tsx            # Not-connected state
│       ├── hooks/
│       │   ├── useCdpConnection.ts       # WebSocket lifecycle to CDP
│       │   ├── useScreencast.ts          # Frame rendering on canvas
│       │   ├── useInputForwarding.ts     # Mouse/keyboard → CDP Input.*
│       │   ├── useDevMode.ts             # DOM inspection overlay
│       │   ├── useBrowserStatus.ts       # Polling browser status
│       │   ├── useTabManager.ts          # Tab state from CDP
│       │   ├── useConsole.ts             # Polls console logs
│       │   ├── useNetwork.ts             # Polls network requests
│       │   └── useErrors.ts              # Polls page errors
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

### 2. Address Bar (Top Toolbar)

```
┌──────────────────────────────────────────────────────────────┐
│  ◀  ▶  ↻  │  🔒 https://example.com/page  │  ⚙  [Dev ◉]  │
└──────────────────────────────────────────────────────────────┘
```

- Nav buttons: `Button variant="ghost" size="icon"` with Lucide icons (`ChevronLeft`, `ChevronRight`, `RotateCw`)
- Lock icon (`Lock`/`Unlock`) for HTTPS/HTTP
- URL `Input` — editable, Enter navigates
- Right side controls (separated by a `Separator`):
  - Settings gear (`Settings2`): dropdown with viewport preset selector
  - Dev Mode `Switch` with `Code2` icon label — toggles element inspector overlay

### 3. Viewport — The Core

- `<canvas>` element filling available panel height
- Two-layer approach: bottom canvas for screencast, top canvas (absolute positioned) for dev mode overlay
- Renders JPEG frames from `Page.screencastFrame`
- `tabIndex={0}` to capture keyboard focus
- Mouse events: click, move, scroll → scaled to viewport coords → `Input.dispatchMouseEvent`
- Keyboard events → `Input.dispatchKeyEvent`
- Loading spinner overlay when connecting

### 4. Debug Drawer (Bottom Panel)

When Dev Mode is on, a resizable bottom drawer slides up below the viewport (like real Chrome DevTools):

```
┌──────────────────────────────────────────────────────────────┐
│  [Console]  [Network]  [Errors]  [Elements]          [×]     │
├──────────────────────────────────────────────────────────────┤
│  12:01:03  [info]  Page loaded in 1.2s                       │
│  12:01:04  [warn]  Deprecated API call at line 42            │
│  12:01:05  [error] Uncaught TypeError: Cannot read ...       │
│                                                              │
│  ▸ {message: "Failed to fetch", stack: "..."}                │
└──────────────────────────────────────────────────────────────┘
```

- **Tabs**: `Console`, `Network`, `Errors`, `Elements` — using shadcn `Tabs` component
- **Console tab**: Live console logs from `agent-browser console` — colored by level (`text-muted-foreground` info, `text-yellow-500` warn, `text-destructive` error), monospace font
- **Network tab**: Request list from `agent-browser network requests` — method badge, URL, status code (green 2xx, yellow 3xx, red 4xx/5xx), duration, size
- **Errors tab**: Page errors from `agent-browser errors` — stack traces in collapsible `Collapsible` component
- **Elements tab**: Element inspector — click viewport element → shows DOM path, computed styles, box model (reuses Dev Mode overlay selection)
- **Resizable**: `ResizablePanel` from shadcn, drag handle at top, default 30% of panel height
- **Auto-scroll**: New entries auto-scroll to bottom, pauses on manual scroll up
- Drawer state persists in `localStorage`

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

### 5. Empty State (No Browser Running)

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

## Commands (CLI Layer) — 30 commands

All commands wrap `agent-browser` CLI via `child_process.execFile` with `--json` flag and parse structured output.

### Core Navigation (5)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `open` | `url: string` | `agent-browser open <url>` | `{ url, title }` |
| `close` | — | `agent-browser close` | `{ closed: true }` |
| `status` | — | `agent-browser get cdp-url` | `{ connected, cdpUrl, url, title, session }` |
| `back` | — | `agent-browser back` | `{ url, title }` |
| `forward` | — | `agent-browser forward` | `{ url, title }` |
| `reload` | — | `agent-browser reload` | `{ url, title }` |

### Interaction (7)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `click` | `ref: string` | `agent-browser click <ref>` | `{ clicked: true }` |
| `type` | `ref: string, text: string` | `agent-browser type <ref> <text>` | `{ typed: true }` |
| `fill` | `ref: string, text: string` | `agent-browser fill <ref> <text>` | `{ filled: true }` |
| `select` | `ref: string, value: string` | `agent-browser select <ref> <val>` | `{ selected: true }` |
| `hover` | `ref: string` | `agent-browser hover <ref>` | `{ hovered: true }` |
| `scroll` | `direction: string, pixels?: number` | `agent-browser scroll <dir> [px]` | `{ scrolled: true }` |
| `wait` | `target: string` | `agent-browser wait <sel\|ms>` | `{ waited: true }` |

### Capture & Extraction (7)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `screenshot` | `path?: string` | `agent-browser screenshot` | `{ path, dataUrl }` |
| `snapshot` | `interactive?: bool, compact?: bool` | `agent-browser snapshot [-i] [-c]` | `{ tree: string }` |
| `eval` | `code: string` | `agent-browser eval <code>` | `{ result }` |
| `get-text` | `ref?: string` | `agent-browser get text [ref]` | `{ text: string }` |
| `get-html` | `ref?: string` | `agent-browser get html [ref]` | `{ html: string }` |
| `get-url` | — | `agent-browser get url` | `{ url: string }` |
| `pdf` | `path: string` | `agent-browser pdf <path>` | `{ path: string }` |

### Find Elements (3)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `find-role` | `role: string, action: string, name?: string` | `agent-browser find role <role> <action>` | `{ result }` |
| `find-text` | `text: string, action: string` | `agent-browser find text <text> <action>` | `{ result }` |
| `find-label` | `label: string, action: string, text?: string` | `agent-browser find label <label> <action> [text]` | `{ result }` |

### Tabs & Cookies (3)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `tabs` | — | `agent-browser tab list` | `{ tabs: Tab[] }` |
| `cookies-get` | `url?: string` | `agent-browser cookies get` | `{ cookies: Cookie[] }` |
| `cookies-set` | `name, value, domain, ...` | `agent-browser cookies set` | `{ set: true }` |

### Debug & Inspect (8)

| Command | Args | Wraps | Returns |
|---------|------|-------|---------|
| `console` | `clear?: bool` | `agent-browser console [--clear]` | `{ logs: LogEntry[] }` |
| `errors` | `clear?: bool` | `agent-browser errors [--clear]` | `{ errors: ErrorEntry[] }` |
| `network` | `filter?: string, clear?: bool` | `agent-browser network requests [--filter] [--clear]` | `{ requests: Request[] }` |
| `highlight` | `ref: string` | `agent-browser highlight <ref>` | `{ highlighted: true }` |
| `trace-start` | `path?: string` | `agent-browser trace start [path]` | `{ tracing: true }` |
| `trace-stop` | — | `agent-browser trace stop` | `{ path: string }` |
| `diff-snapshot` | — | `agent-browser diff snapshot` | `{ diff: string }` |
| `diff-screenshot` | `baseline: string` | `agent-browser diff screenshot --baseline <path>` | `{ diff: DiffResult }` |

Each command uses `defineCommand()` with Zod schemas:

```typescript
import { z, defineCommand } from '@renre-kit/extension-sdk/node';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default defineCommand({
  args: { url: z.string() },
  handler: async (ctx) => {
    const { stdout } = await execFileAsync('agent-browser', ['open', '--json', ctx.args.url]);
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
- `manifest.json` — 30 commands, 1 panel, config schema, agent skill
- `package.json` — `@renre-kit/extension-sdk` dependency
- `build.js` — `buildExtension` (30 commands + index) + `buildPanel` (1 panel)
- `tsconfig.json`, `tsconfig.lint.json`, `eslint.config.mjs`
- `icon.svg` — globe/browser icon

### Step 2: CLI commands (30 commands, 6 groups)
- **Core Navigation (6):** `open`, `close`, `status`, `back`, `forward`, `reload`
- **Interaction (7):** `click`, `type`, `fill`, `select`, `hover`, `scroll`, `wait`
- **Capture & Extraction (7):** `screenshot`, `snapshot`, `eval`, `get-text`, `get-html`, `get-url`, `pdf`
- **Find Elements (3):** `find-role`, `find-text`, `find-label`
- **Tabs & Cookies (3):** `tabs`, `cookies-get`, `cookies-set`
- **Debug & Inspect (8):** `console`, `errors`, `network`, `highlight`, `trace-start`, `trace-stop`, `diff-snapshot`, `diff-screenshot`
- All commands use `--json` flag for structured output
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
- `useConsole` — polls `agent-browser console --json`, accumulates log entries
- `useNetwork` — polls `agent-browser network requests --json`, accumulates requests
- `useErrors` — polls `agent-browser errors --json`, accumulates page errors

### Step 7: Panel components
- `EmptyState` — URL input + Launch button (when no browser running)
- `TabBar` — renders tabs, handles switching
- `AddressBar` — URL display/input, nav buttons, settings gear, dev mode switch
- `Viewport` — dual-canvas (screencast + overlay), focus management
- `DevToolsOverlay` — element info card on selection
- `DebugDrawer` — resizable bottom panel with tabs (Console, Network, Errors, Elements)
- `ConsolePanel` — color-coded log entries, auto-scroll, clear button
- `NetworkPanel` — request list with method/status/duration/size columns
- `ErrorsPanel` — page errors with collapsible stack traces
- `ElementsPanel` — selected element DOM path, computed styles, box model
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
