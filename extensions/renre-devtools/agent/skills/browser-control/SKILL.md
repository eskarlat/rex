---
name: browser-control
description: Use this skill to launch, close, and control a browser instance — navigate to URLs, manage tabs, and control the browser lifecycle. Use when the user wants to open a website, browse pages, or manage browser sessions.
---

# renre-devtools/browser-control

Launch and control a Chromium browser directly from the CLI. The browser persists between commands — launch once, then use other devtools commands to interact with it.

## Commands

### renre-devtools:launch

Launch a new browser instance.

**Arguments:**

- `--headless` (flag) — Launch in headless mode (no visible window)
- `--port <number>` — Chrome remote debugging port (default: 9222)

**Example:**

```
renre-kit renre-devtools:launch
renre-kit renre-devtools:launch --headless
```

### renre-devtools:close

Close the browser and clean up all state.

**Example:**

```
renre-kit renre-devtools:close
```

### renre-devtools:navigate

Navigate the active tab to a URL.

**Arguments:**

- `--url <string>` (required) — The URL to navigate to
- `--wait <string>` — Wait until: "load" or "domcontentloaded" (default)

**Example:**

```
renre-kit renre-devtools:navigate --url "https://example.com"
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

- `--index <number>` (required) — Tab index (from `devtools:tabs` output)

**Example:**

```
renre-kit renre-devtools:tab --index 0
```

## Typical Workflow

1. `renre-devtools:launch` — Start the browser
2. `renre-devtools:navigate --url "https://example.com"` — Open a page
3. Use `dom-inspection`, `javascript-execution`, etc. to interact
4. `renre-devtools:close` — Done
