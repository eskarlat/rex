---
name: network-analysis
description: Use this skill to monitor network requests, inspect cookies, read browser storage (localStorage/sessionStorage), measure page performance, and manage log output. Use when debugging API calls, checking stored data, analyzing load times, investigating network issues, or clearing captured logs.
---

# chrome-debugger/network-analysis

Monitor network traffic, inspect cookies/storage, measure performance, and manage logs.

## Commands

### chrome-debugger:network

Show captured network requests as a markdown table or JSON.

**Arguments:**

- `--filter <string>` — Filter URLs containing this string
- `--method <string>` — Filter by HTTP method (GET, POST, PUT, DELETE)
- `--limit <number>` — Max requests to show (default: 50)
- `--offset <number>` — Skip first N log lines (for incremental reads)
- `--format <string>` — Output format: "markdown" (default) or "json"

**Examples:**

```
renre-kit chrome-debugger:network
renre-kit chrome-debugger:network --filter "api" --method POST
renre-kit chrome-debugger:network --format json --limit 100
renre-kit chrome-debugger:network --offset 50 --limit 20
```

**JSON format returns:** `{ entries: [{ timestamp, method, url, status, type, size, duration }], total }`

### chrome-debugger:console

Show captured console messages from the browser.

**Arguments:**

- `--level <string>` — Filter by level: log, warn, error, info, debug, warning
- `--limit <number>` — Max messages to show (default: 50)
- `--offset <number>` — Skip first N log lines (for incremental reads)
- `--format <string>` — Output format: "markdown" (default) or "json"

**Examples:**

```
renre-kit chrome-debugger:console
renre-kit chrome-debugger:console --level error
renre-kit chrome-debugger:console --format json --limit 200
```

**JSON format returns:** `{ entries: [{ timestamp, level, text }], total }`

### chrome-debugger:clear-logs

Clear all captured console and network log files.

**Example:**

```
renre-kit chrome-debugger:clear-logs
```

### chrome-debugger:cookies

List browser cookies.

**Arguments:**

- `--domain <string>` — Filter by domain

**Examples:**

```
renre-kit chrome-debugger:cookies
renre-kit chrome-debugger:cookies --domain "example.com"
```

### chrome-debugger:storage

Show localStorage or sessionStorage contents.

**Arguments:**

- `--type <string>` — "local" (default) or "session"

**Examples:**

```
renre-kit chrome-debugger:storage
renre-kit chrome-debugger:storage --type session
```

### chrome-debugger:performance

Get performance metrics including Core Web Vitals, navigation timing, and runtime stats.

**Example:**

```
renre-kit chrome-debugger:performance
```

Returns:
- Web Vitals: FCP, TTFB, DOM Interactive, DOM Complete, Load Event
- Navigation Timing: DNS, TCP, TTFB, Download breakdown
- Runtime Metrics: heap size, DOM nodes, layout counts, event listeners

## Tips

- Network requests are captured from launch — navigate to a page first, then check `network`
- Use `--filter "api"` to focus on API calls
- Use `--format json` for programmatic processing (e.g., in LLM workflows)
- Use `--offset` with `--limit` for paginated reading of large log files
- Use `clear-logs` to reset monitoring when starting a new debugging session
- Use `performance` after page load for meaningful metrics
- Combine `cookies` + `storage` to understand the full client-side state
