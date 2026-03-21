---
name: network-analysis
description: Use this skill to monitor network requests, inspect cookies, read browser storage (localStorage/sessionStorage), and measure page performance. Use when debugging API calls, checking stored data, analyzing load times, or investigating network issues.
---

# renre-devtools/network-analysis

Monitor network traffic, inspect cookies/storage, and measure performance.

## Commands

### renre-devtools:network

Show captured network requests as a markdown table.

**Arguments:**

- `--filter <string>` — Filter URLs containing this string
- `--method <string>` — Filter by HTTP method (GET, POST, etc.)
- `--limit <number>` — Max requests to show (default: 50)

**Examples:**

```
renre-kit renre-devtools:network
renre-kit renre-devtools:network --filter "api"
renre-kit renre-devtools:network --method POST
renre-kit renre-devtools:network --filter ".json" --limit 10
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
- Use `performance` after page load for meaningful metrics
- Combine `cookies` + `storage` to understand the full client-side state
