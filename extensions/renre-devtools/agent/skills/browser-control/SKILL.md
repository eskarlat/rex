---
name: browser-control
description: Use this skill to launch, close, and control a browser instance — navigate to URLs, manage tabs, check browser status, detect/install Chrome, and control the browser lifecycle. Use when the user wants to open a website, browse pages, manage browser sessions, or troubleshoot browser availability.
---

# renre-devtools/browser-control

Launch and control a Chromium browser directly from the CLI. The browser persists between commands — launch once, then use other devtools commands to interact with it. A global session ensures only one browser runs at a time across all projects.

## Commands

### renre-devtools:launch

Launch a new browser instance with Chrome DevTools Protocol enabled.

**Arguments:**

- `--headless` (flag) — Launch in headless mode (no visible window)
- `--port <number>` — Chrome remote debugging port (default: 9222)

**Example:**

```
renre-kit renre-devtools:launch
renre-kit renre-devtools:launch --headless
renre-kit renre-devtools:launch --port 9333
```

**Notes:**
- Only one browser instance is supported globally. If one is already running (even from another project), you must close it first.
- The browser persists after the command returns — subsequent commands reconnect via WebSocket.
- Network and console monitoring starts automatically on launch.

### renre-devtools:close

Close the browser and clean up all state (logs, session files).

**Example:**

```
renre-kit renre-devtools:close
```

### renre-devtools:status

Get the current browser session status. Performs session recovery — checks if the process is alive and attempts to reconnect.

**Example:**

```
renre-kit renre-devtools:status
```

**Returns (JSON):**
- `running` — Whether browser is alive and connectable
- `pid`, `port`, `launchedAt`, `tabCount`, `tabs` — Session details
- `staleSessionCleaned` — True if a dead session was cleaned up

### renre-devtools:navigate

Navigate the active tab to a URL.

**Arguments:**

- `--url <string>` (required) — The URL to navigate to
- `--wait <string>` — Wait until: "load" or "domcontentloaded" (default)

**Example:**

```
renre-kit renre-devtools:navigate --url "https://example.com"
renre-kit renre-devtools:navigate --url "https://app.test" --wait load
```

### renre-devtools:tabs

List all open browser tabs.

**Example:**

```
renre-kit renre-devtools:tabs
```

Returns a markdown table with index, title, and URL for each tab.

### renre-devtools:tab

Switch to a specific tab by index.

**Arguments:**

- `--index <number>` (required) — Tab index (from `tabs` output)

**Example:**

```
renre-kit renre-devtools:tab --index 0
```

### renre-devtools:chrome-check

Check if Chrome or Chromium is installed. Checks Puppeteer bundled Chromium first, then system paths.

**Example:**

```
renre-kit renre-devtools:chrome-check
```

**Returns (JSON):** `{ found, path, source }` or `{ found: false, canInstall: true }`

### renre-devtools:chrome-install

Download and install Chromium via Puppeteer's built-in browser download.

**Example:**

```
renre-kit renre-devtools:chrome-install
```

**Returns (JSON):** `{ installed, path }` on success

### renre-devtools:heartbeat

Update the browser session heartbeat timestamp. Used by the dashboard to detect orphaned sessions.

**Example:**

```
renre-kit renre-devtools:heartbeat
```

## Typical Workflow

1. `renre-devtools:chrome-check` — Verify Chrome is available
2. `renre-devtools:launch` — Start the browser
3. `renre-devtools:navigate --url "https://example.com"` — Open a page
4. Use `dom-inspection`, `javascript-execution`, etc. to interact
5. `renre-devtools:tabs` — Check open tabs
6. `renre-devtools:close` — Done

## Troubleshooting

- **"Browser Already Running"**: Run `renre-devtools:close` first, or `renre-devtools:status` to check
- **"Chrome Not Found"**: Run `renre-devtools:chrome-install` to download Chromium
- **Connection failures**: Run `renre-devtools:status` — it auto-cleans stale sessions
