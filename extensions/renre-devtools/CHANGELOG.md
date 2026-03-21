# Changelog

All notable changes to the renre-devtools extension will be documented in this file.

## [1.0.0] - 2026-03-21

### Added

#### Dashboard Overhaul
- **Overview panel**: Browser controls, navigation bar, tab list, inspect toggle, screenshot button
- **Screenshots panel**: Gallery grid with thumbnails, full-size preview dialog, delete confirmation
- **Logs panel**: Real-time console and network log streaming with level/method filters, pause, and clear
- 12 dedicated React components in `src/ui/components/`
- 9 React hooks in `src/ui/hooks/` (polling, browser status, thumbnails, etc.)
- Singleton WebSocket manager for `/api/events` real-time channel

#### Browser Session Management
- Global browser session at `~/.renre-kit/browser-session.json`
- Orphan detection via PID check on launch
- Session recovery via `status` command
- Heartbeat mechanism (30s interval from Overview panel)

#### New CLI Commands
- `status` — Session recovery with PID check and reconnect attempt
- `heartbeat` — Update global session `lastSeenAt` timestamp
- `chrome-check` — Detect Chrome/Chromium (bundled Puppeteer + system paths)
- `chrome-install` — Download Chromium via Puppeteer
- `screenshot-list` — List saved screenshots with metadata
- `screenshot-read` — Return screenshot as base64 data URL
- `screenshot-delete` — Delete screenshot file and metadata entry
- `clear-logs` — Truncate console and network JSONL log files

#### Enhanced Existing Commands
- `console` — Added `--offset` and `--format json` arguments
- `network` — Added `--offset` and `--format json` arguments
- `screenshot` — Added `--dir` argument and automatic metadata registration
- `launch` — Global session write and cross-project orphan detection
- `close` — Global session cleanup

#### Agent Skills
- `browser-control` — Launch, close, navigate, tabs management
- `dom-inspection` — DOM tree, selectors, click, type, styles, accessibility
- `javascript-execution` — Eval, console capture
- `network-analysis` — Network requests, cookies, storage, performance
- `browser-screenshot` — Screenshot capture and management
- `element-picker` — Visual element selection and highlight

### Removed
- Single `devtools-panel` panel (replaced by Overview/Screenshots/Logs)
- `browser-status` widget
