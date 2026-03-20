---
name: playwright
description: Use this skill when the user needs to interact with a web browser — e.g. "navigate to a page", "click a button", "fill out a form", "take a screenshot", "test a web page"
---

# playwright-mcp

An MCP extension that provides browser automation and testing capabilities via the Playwright MCP server.

## Commands

### playwright-mcp:browser_navigate
Navigate the browser to a URL.

**Parameters:**
- `url` (string, required) — The URL to navigate to

**Example:**
```
renre-kit playwright-mcp:browser_navigate --url "https://example.com"
```

### playwright-mcp:browser_screenshot
Take a screenshot of the current page or a specific element.

**Example:**
```
renre-kit playwright-mcp:browser_screenshot
```

### playwright-mcp:browser_click
Click an element on the page.

**Parameters:**
- `element` (string, required) — Human-readable description of the element to click
- `ref` (string, required) — Exact target element reference from the page snapshot

**Example:**
```
renre-kit playwright-mcp:browser_click --element "Submit button" --ref "submit-btn"
```

### playwright-mcp:browser_fill
Fill in an input field.

**Parameters:**
- `element` (string, required) — Human-readable description of the element to fill
- `ref` (string, required) — Exact target element reference from the page snapshot
- `value` (string, required) — The value to fill in

**Example:**
```
renre-kit playwright-mcp:browser_fill --element "Search input" --ref "search-input" --value "hello world"
```

### playwright-mcp:browser_snapshot
Capture an accessibility snapshot of the current page for element discovery.

**Example:**
```
renre-kit playwright-mcp:browser_snapshot
```

### playwright-mcp:browser_evaluate
Execute JavaScript in the browser console.

**Parameters:**
- `expression` (string, required) — JavaScript expression to evaluate

**Example:**
```
renre-kit playwright-mcp:browser_evaluate --expression "document.title"
```
