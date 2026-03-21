---
name: network-analysis
description: Use this skill to monitor network requests, inspect cookies, read browser storage (localStorage/sessionStorage), measure page performance, and manage log output. Use when debugging API calls, checking stored data, analyzing load times, investigating network issues, or clearing captured logs.
---

# renre-devtools/network-analysis

Monitor network traffic, inspect cookies/storage, measure performance, and manage logs.

## Commands

### renre-devtools:network

Show captured network requests as a markdown table or JSON.

**Arguments:**

- `--filter <string>` — Filter URLs containing this string
- `--method <string>` — Filter by HTTP method (GET, POST, PUT, DELETE)
- `--limit <number>` — Max requests to show (default: 50)
- `--offset <number>` — Skip first N log lines (for incremental reads)
- `--format <string>` — Output format: "markdown" (default) or "json"

**Examples:**

```
renre-kit renre-devtools:network
renre-kit renre-devtools:network --filter "api" --method POST
renre-kit renre-devtools:network --format json --limit 100
renre-kit renre-devtools:network --offset 50 --limit 20
```

**JSON format returns:** `{ entries: [{ timestamp, method, url, status, type, size, duration }], total }`

### renre-devtools:console

Show captured console messages from the browser.

**Arguments:**

- `--level <string>` — Filter by level: log, warn, error, info, debug, warning
- `--limit <number>` — Max messages to show (default: 50)
- `--offset <number>` — Skip first N log lines (for incremental reads)
- `--format <string>` — Output format: "markdown" (default) or "json"

**Examples:**

```
renre-kit renre-devtools:console
renre-kit renre-devtools:console --level error
renre-kit renre-devtools:console --format json --limit 200
```

**JSON format returns:** `{ entries: [{ timestamp, level, text }], total }`

### renre-devtools:clear-logs

Clear all captured console and network log files.

**Example:**

```
renre-kit renre-devtools:clear-logs
```

### renre-devtools:cookies

List browser cookies.

**Arguments:**

- `--domain <string>` — Filter by domain

**Examples:**

```
renre-kit renre-devtools:cookies
renre-kit renre-devtools:cookies --domain "example.com"
```

### renre-devtools:storage

Show localStorage or sessionStorage contents.

**Arguments:**

- `--type <string>` — "local" (default) or "session"

**Examples:**

```
renre-kit renre-devtools:storage
renre-kit renre-devtools:storage --type session
```

### renre-devtools:performance

Get performance metrics including Core Web Vitals, navigation timing, and runtime stats.

**Example:**

```
renre-kit renre-devtools:performance
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
