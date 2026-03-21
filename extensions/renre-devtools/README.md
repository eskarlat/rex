# Browser DevTools

Native browser automation and debugging extension for RenreKit. Launch and control a Chromium browser via Chrome DevTools Protocol — inspect DOM, execute JavaScript, capture network traffic, take screenshots, and more — all through CLI commands and a rich dashboard UI.

## Features

- **Browser Lifecycle**: Launch/close a persistent Chromium instance with CDP enabled
- **DOM Inspection**: Query, click, type, get computed styles, accessibility tree
- **JavaScript Execution**: Evaluate JS in page context, capture console output
- **Network Monitoring**: Capture and filter HTTP requests with timing/size data
- **Screenshots**: Full page, element, or viewport captures with gallery management
- **Element Picker**: Visual element selection in the browser for targeted inspection
- **Performance Metrics**: Core Web Vitals, navigation timing, runtime stats
- **Dashboard Panels**: Overview (controls + tabs), Screenshots (gallery), Logs (console + network)
- **Global Session**: Single browser instance across projects with orphan detection
- **Chrome Detection**: Auto-detect or download Chromium via Puppeteer
- **Agent Skills**: 6 SKILL.md definitions for LLM-powered browser automation

## Commands

### Browser Control

| Command | Description |
|---------|-------------|
| `renre-devtools:launch` | Launch browser with CDP enabled |
| `renre-devtools:close` | Close browser and clean up |
| `renre-devtools:status` | Get session status with recovery |
| `renre-devtools:heartbeat` | Update session heartbeat |
| `renre-devtools:chrome-check` | Detect Chrome/Chromium installation |
| `renre-devtools:chrome-install` | Download Chromium via Puppeteer |

### Navigation & Tabs

| Command | Description |
|---------|-------------|
| `renre-devtools:navigate` | Navigate to a URL (`--url`, `--wait`) |
| `renre-devtools:tabs` | List all open tabs |
| `renre-devtools:tab` | Switch to tab by index (`--index`) |

### DOM & Interaction

| Command | Description |
|---------|-------------|
| `renre-devtools:dom` | Get DOM tree (`--selector`, `--depth`) |
| `renre-devtools:select` | Query elements by CSS selector |
| `renre-devtools:click` | Click an element (`--selector`) |
| `renre-devtools:type` | Type into input (`--selector`, `--text`, `--clear`) |
| `renre-devtools:styles` | Get computed styles (`--selector`, `--all`) |
| `renre-devtools:a11y` | Get accessibility tree (`--selector`, `--depth`) |

### JavaScript & Debugging

| Command | Description |
|---------|-------------|
| `renre-devtools:eval` | Execute JS in page (`--code`, `--file`) |
| `renre-devtools:console` | Show console messages (`--level`, `--limit`, `--offset`, `--format`) |
| `renre-devtools:network` | Show network requests (`--filter`, `--method`, `--limit`, `--offset`, `--format`) |
| `renre-devtools:clear-logs` | Clear console and network logs |

### Screenshots

| Command | Description |
|---------|-------------|
| `renre-devtools:screenshot` | Take screenshot (`--selector`, `--full-page`, `--output`, `--dir`, `--encoded`) |
| `renre-devtools:screenshot-list` | List saved screenshots with metadata |
| `renre-devtools:screenshot-read` | Read screenshot as base64 (`--path`) |
| `renre-devtools:screenshot-delete` | Delete a screenshot (`--path`) |

### Element Picker

| Command | Description |
|---------|-------------|
| `renre-devtools:inspect` | Activate element picker (`--timeout`) |
| `renre-devtools:selected` | Get last inspected element details |
| `renre-devtools:highlight` | Highlight element in browser (`--selector`, `--duration`) |

### Other

| Command | Description |
|---------|-------------|
| `renre-devtools:cookies` | List browser cookies (`--domain`) |
| `renre-devtools:storage` | Show localStorage/sessionStorage (`--type`) |
| `renre-devtools:performance` | Get performance metrics and Core Web Vitals |

## Configuration

| Field | Type | Secret | Default | Description |
|-------|------|--------|---------|-------------|
| `headless` | boolean | No | `false` | Launch browser in headless mode |
| `port` | number | No | `9222` | Chrome remote debugging port |

## Dashboard

Three panel tabs accessible at `/extensions/renre-devtools/`:

- **Overview**: Browser controls, navigation bar, tab list, inspect toggle, screenshot button
- **Screenshots**: Gallery grid with thumbnails, full-size preview, delete confirmation
- **Logs**: Real-time console and network log streaming with filters, pause, and clear

## Architecture

```
Browser (Chromium) ← CDP → CLI Commands (Puppeteer) ← REST → Dashboard Panels (React)
                                    ↓
                     Global Session (~/.renre-kit/browser-session.json)
                     Per-project State (.renre-kit/storage/renre-devtools/)
```

- **Persistence**: Browser runs as a detached process. Commands reconnect via `puppeteer.connect()`.
- **Monitoring**: CDP sessions capture network/console events to JSONL files.
- **Real-time**: Panels poll commands every 2-3s. WebSocket via `/api/events` for lifecycle events.
- **No server changes**: All communication through existing REST + WebSocket infrastructure.

## Development

```bash
cd extensions/renre-devtools
pnpm build     # Build commands (tsup) + panels (esbuild)
pnpm test      # Run vitest unit tests
pnpm lint      # ESLint
```

## File Structure

```
src/
  commands/          # 28 CLI command handlers
  shared/            # connection.ts, state.ts, types.ts, formatters.ts
  ui/
    components/      # 12 React components (BrowserControlsCard, TabsCard, etc.)
    hooks/           # 9 React hooks (useBrowserStatus, usePolling, etc.)
    panels/          # 3 panel entry points (overview, screenshots, logs)
    shared/          # types.ts, ws-manager.ts
agent/
  skills/            # 6 SKILL.md definitions for LLM agents
```
