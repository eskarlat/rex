---
name: chrome-devtools
description: Use this skill for browser automation and debugging — navigating pages, clicking elements, typing text, taking screenshots, reading console messages, inspecting network requests, and running performance traces. Requires Node.js 22+ and a Chrome browser.
---

# chrome-devtools-mcp

An MCP extension that provides full Chrome DevTools Protocol access via the official `chrome-devtools-mcp` server by Google.

## Prerequisites

Node.js 22 or newer and a Chrome browser must be available. The MCP server launches Chrome automatically when needed.

## Commands

### chrome-devtools-mcp:browser_navigate
Navigate the browser to a URL.

**Parameters:**
- `url` (string, required) — The URL to navigate to

**Example:**
```
renre-kit chrome-devtools-mcp:browser_navigate --url "https://example.com"
```

### chrome-devtools-mcp:browser_click
Click an element on the page.

**Parameters:**
- `element` (string, required) — Description of the element to click
- `ref` (string, optional) — Element reference from a snapshot

**Example:**
```
renre-kit chrome-devtools-mcp:browser_click --element "Submit button" --ref "42"
```

### chrome-devtools-mcp:browser_type
Type text into an input field.

**Parameters:**
- `element` (string, required) — Description of the input field
- `ref` (string, optional) — Element reference from a snapshot
- `text` (string, required) — Text to type

**Example:**
```
renre-kit chrome-devtools-mcp:browser_type --element "Search input" --ref "12" --text "hello world"
```

### chrome-devtools-mcp:browser_screenshot
Capture a screenshot of the current page.

**Example:**
```
renre-kit chrome-devtools-mcp:browser_screenshot
```

### chrome-devtools-mcp:browser_snapshot
Get an accessibility snapshot of the page (useful for finding element refs).

**Example:**
```
renre-kit chrome-devtools-mcp:browser_snapshot
```

### chrome-devtools-mcp:browser_evaluate
Execute JavaScript in the browser console.

**Parameters:**
- `expression` (string, required) — JavaScript expression to evaluate

**Example:**
```
renre-kit chrome-devtools-mcp:browser_evaluate --expression "document.title"
```

### chrome-devtools-mcp:browser_console_messages
Get browser console messages.

**Example:**
```
renre-kit chrome-devtools-mcp:browser_console_messages
```

### chrome-devtools-mcp:browser_network_requests
Get browser network requests.

**Example:**
```
renre-kit chrome-devtools-mcp:browser_network_requests
```

### chrome-devtools-mcp:browser_wait_for
Wait for text or a CSS selector to appear on the page.

**Parameters:**
- `text` (string, optional) — Text to wait for
- `selector` (string, optional) — CSS selector to wait for

**Example:**
```
renre-kit chrome-devtools-mcp:browser_wait_for --text "Loading complete"
```

### chrome-devtools-mcp:browser_tab_list
List all open browser tabs.

**Example:**
```
renre-kit chrome-devtools-mcp:browser_tab_list
```

### chrome-devtools-mcp:browser_tab_create
Open a new browser tab.

**Parameters:**
- `url` (string, optional) — URL to open in the new tab

**Example:**
```
renre-kit chrome-devtools-mcp:browser_tab_create --url "https://example.com"
```

### chrome-devtools-mcp:browser_tab_close
Close a browser tab.

**Parameters:**
- `tabId` (string, optional) — Tab ID to close (from tab list)

**Example:**
```
renre-kit chrome-devtools-mcp:browser_tab_close --tabId "abc123"
```

### chrome-devtools-mcp:browser_tab_select
Switch to a specific browser tab.

**Parameters:**
- `tabId` (string, required) — Tab ID to switch to

**Example:**
```
renre-kit chrome-devtools-mcp:browser_tab_select --tabId "abc123"
```

### chrome-devtools-mcp:browser_file_upload
Upload a file to a file input element.

**Parameters:**
- `paths` (string, required) — File path(s) to upload

**Example:**
```
renre-kit chrome-devtools-mcp:browser_file_upload --paths "/path/to/file.png"
```

### chrome-devtools-mcp:browser_performance_trace
Record a performance trace for analysis.

**Example:**
```
renre-kit chrome-devtools-mcp:browser_performance_trace
```
