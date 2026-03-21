---
name: browser-control
description: Use this skill to launch, close, and control a browser instance — navigate to URLs, manage tabs, check browser status, detect/install Chrome, and control the browser lifecycle. Use when the user wants to open a website, browse pages, manage browser sessions, or troubleshoot browser availability.
---

# chrome-debugger/browser-control

Launch and control a Chromium browser directly from the CLI. The browser persists between commands — launch once, then use other devtools commands to interact with it. A global session ensures only one browser runs at a time across all projects.

## Commands

### chrome-debugger:launch

Launch a new browser instance with Chrome DevTools Protocol enabled.

**Arguments:**

- `--headless` (flag) — Launch in headless mode (no visible window)
- `--port <number>` — Chrome remote debugging port (default: 9222)

**Example:**

```
renre-kit chrome-debugger:launch
renre-kit chrome-debugger:launch --headless
renre-kit chrome-debugger:launch --port 9333
```

**Notes:**
- Only one browser instance is supported globally. If one is already running (even from another project), you must close it first.
- The browser persists after the command returns — subsequent commands reconnect via WebSocket.
- Network and console monitoring starts automatically on launch.

### chrome-debugger:close

Close the browser and clean up all state (logs, session files).

**Example:**

```
renre-kit chrome-debugger:close
```

### chrome-debugger:status

Get the current browser session status. Performs session recovery — checks if the process is alive and attempts to reconnect.

**Example:**

```
renre-kit chrome-debugger:status
```

**Returns (JSON):**
- `running` — Whether browser is alive and connectable
- `pid`, `port`, `launchedAt`, `tabCount`, `tabs` — Session details
- `staleSessionCleaned` — True if a dead session was cleaned up

### chrome-debugger:navigate

Navigate the active tab to a URL.

**Arguments:**

- `--url <string>` (required) — The URL to navigate to
- `--wait <string>` — Wait until: "load" or "domcontentloaded" (default)

**Example:**

```
renre-kit chrome-debugger:navigate --url "https://example.com"
renre-kit chrome-debugger:navigate --url "https://app.test" --wait load
```

### chrome-debugger:tabs

List all open browser tabs.

**Example:**

```
renre-kit chrome-debugger:tabs
```

Returns a markdown table with index, title, and URL for each tab.

### chrome-debugger:tab

Switch to a specific tab by index.

**Arguments:**

- `--index <number>` (required) — Tab index (from `tabs` output)

**Example:**

```
renre-kit chrome-debugger:tab --index 0
```

### chrome-debugger:chrome-check

Check if Chrome or Chromium is installed. Checks Puppeteer bundled Chromium first, then system paths.

**Example:**

```
renre-kit chrome-debugger:chrome-check
```

**Returns (JSON):** `{ found, path, source }` or `{ found: false, canInstall: true }`

### chrome-debugger:chrome-install

Download and install Chromium via Puppeteer's built-in browser download.

**Example:**

```
renre-kit chrome-debugger:chrome-install
```

**Returns (JSON):** `{ installed, path }` on success

### chrome-debugger:heartbeat

Update the browser session heartbeat timestamp. Used by the dashboard to detect orphaned sessions.

**Example:**

```
renre-kit chrome-debugger:heartbeat
```

## Typical Workflow

1. `chrome-debugger:chrome-check` — Verify Chrome is available
2. `chrome-debugger:launch` — Start the browser
3. `chrome-debugger:navigate --url "https://example.com"` — Open a page
4. Use `dom-inspection`, `javascript-execution`, etc. to interact
5. `chrome-debugger:tabs` — Check open tabs
6. `chrome-debugger:close` — Done

## Troubleshooting

- **"Browser Already Running"**: Run `chrome-debugger:close` first, or `chrome-debugger:status` to check
- **"Chrome Not Found"**: Run `chrome-debugger:chrome-install` to download Chromium
- **Connection failures**: Run `chrome-debugger:status` — it auto-cleans stale sessions
