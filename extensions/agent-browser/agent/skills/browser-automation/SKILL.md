---
name: browser-automation
description: Use this skill when the user needs to browse web pages, extract data from websites, fill forms, debug web applications, or automate browser interactions. This skill provides a headless Chrome browser controlled via CLI commands.
---

# agent-browser/browser-automation

Browser automation for developers and business users — navigate pages, extract data, fill forms, debug applications, and automate multi-step workflows.

## Section 1: Core Workflow — The Snapshot Loop

The fundamental pattern for all browser automation:

1. **Open** a URL: `agent-browser:open --url "https://example.com"`
2. **Wait** for the page: `agent-browser:wait --target "networkidle"`
3. **Snapshot** interactive elements: `agent-browser:snapshot --interactive true`
4. **Interact** using refs from snapshot (e.g. `@e1`, `@e2`)
5. **Re-snapshot** after page changes to get updated refs

```
# Example: Search Google
renre-kit agent-browser:open --url "https://google.com"
renre-kit agent-browser:snapshot --interactive true
# Output shows: @e1 = search input, @e2 = search button
renre-kit agent-browser:fill --ref "@e1" --text "renrekit docs"
renre-kit agent-browser:click --ref "@e2"
renre-kit agent-browser:wait --target "networkidle"
renre-kit agent-browser:snapshot --interactive true
```

### Navigation Commands

| Command | Description |
|---------|-------------|
| `open --url <url>` | Navigate to URL |
| `back` | Go back in history |
| `forward` | Go forward in history |
| `reload` | Reload current page |
| `close` | Close browser session |
| `status` | Get browser status and CDP URL |

## Section 2: Data Extraction

### Text Extraction

```
# Get all visible text from page
renre-kit agent-browser:get-text

# Get text from specific element
renre-kit agent-browser:get-text --ref "@e5"

# Get HTML content
renre-kit agent-browser:get-html --ref "#main-content"

# Get current URL
renre-kit agent-browser:get-url

# Export page as PDF
renre-kit agent-browser:pdf --path "/tmp/report.pdf"
```

### JavaScript Evaluation

```
# Extract structured data
renre-kit agent-browser:eval --code "JSON.stringify([...document.querySelectorAll('table tr')].map(r => [...r.cells].map(c => c.textContent)))"

# Get page title
renre-kit agent-browser:eval --code "document.title"
```

### Screenshots

```
# Take screenshot
renre-kit agent-browser:screenshot --path "/tmp/page.png"
```

### Extraction Patterns

**Tables**: Use `eval` with `querySelectorAll('table tr')` to extract tabular data as JSON.

**Pagination**: Loop: snapshot → extract → find "Next" button → click → wait → repeat.

**Dynamic content**: Always `wait` after interactions — SPAs update asynchronously.

## Section 3: Form Automation

### Interaction Commands

| Command | Description |
|---------|-------------|
| `click --ref <ref>` | Click element |
| `type --ref <ref> --text <text>` | Type text (appends) |
| `fill --ref <ref> --text <text>` | Clear and fill text |
| `select --ref <ref> --value <val>` | Select dropdown option |
| `hover --ref <ref>` | Hover over element |
| `scroll --direction <dir> [--pixels <n>]` | Scroll page |
| `wait --target <selector\|ms>` | Wait for element or time |

### Semantic Element Finding

Instead of snapshot refs, find elements by meaning:

```
# Click a button by role
renre-kit agent-browser:find-role --role "button" --action "click" --name "Submit"

# Fill input by label
renre-kit agent-browser:find-label --label "Email" --action "fill" --text "user@example.com"

# Click by visible text
renre-kit agent-browser:find-text --text "Sign In" --action "click"
```

### Login Flow Example

```
renre-kit agent-browser:open --url "https://app.example.com/login"
renre-kit agent-browser:wait --target "#email"
renre-kit agent-browser:fill --ref "#email" --text "user@example.com"
renre-kit agent-browser:fill --ref "#password" --text "secretpass"
renre-kit agent-browser:click --ref "button[type=submit]"
renre-kit agent-browser:wait --target "networkidle"
```

### Cookie Injection (Pre-authenticated Sessions)

```
# Set auth cookie before navigating
renre-kit agent-browser:cookies-set --name "session" --value "abc123" --domain ".example.com" --httpOnly true --secure true
renre-kit agent-browser:open --url "https://app.example.com/dashboard"
```

## Section 4: Debugging

### Console Logs

```
renre-kit agent-browser:console
# Returns timestamped log entries with levels: info, warn, error

renre-kit agent-browser:console --clear true
# Clear console log buffer
```

### Page Errors

```
renre-kit agent-browser:errors
# Returns page errors with stack traces

renre-kit agent-browser:errors --clear true
```

### Network Requests

```
renre-kit agent-browser:network
# Returns all captured network requests with method, status, duration, size

renre-kit agent-browser:network --filter "api" --clear false
# Filter requests by URL pattern
```

### Element Inspection

```
# Highlight element on page
renre-kit agent-browser:highlight --ref "@e3"
```

### Performance Tracing

```
# Start Chrome DevTools trace
renre-kit agent-browser:trace-start --path "/tmp/trace.json"

# ... perform actions ...

# Stop and save trace
renre-kit agent-browser:trace-stop
# Open trace in chrome://tracing
```

### Visual Comparison

```
# Compare current snapshot with previous
renre-kit agent-browser:diff-snapshot

# Compare screenshot with baseline
renre-kit agent-browser:diff-screenshot --baseline "/path/to/baseline.png"
```

## Section 5: Batch Operations

Execute multiple commands atomically in a single process invocation:

```
renre-kit agent-browser:batch --commands '[["open","https://example.com"],["wait","networkidle"],["screenshot","/tmp/page.png"],["get-text"]]'
```

Use `--bail true` to stop on first error (default: continue all).

### When to Use Batch

- Multi-step workflows where speed matters
- Atomic sequences (login → navigate → extract)
- Avoiding per-command process startup overhead

## Section 6: Command Reference

### Core Navigation (6)
| Command | Args | Description |
|---------|------|-------------|
| `open` | `url` | Navigate to URL |
| `close` | — | Close browser session |
| `status` | — | Get browser status and CDP URL |
| `back` | — | Navigate back |
| `forward` | — | Navigate forward |
| `reload` | — | Reload page |

### Interaction (7)
| Command | Args | Description |
|---------|------|-------------|
| `click` | `ref` | Click element |
| `type` | `ref`, `text` | Type text into element |
| `fill` | `ref`, `text` | Clear and fill element |
| `select` | `ref`, `value` | Select dropdown option |
| `hover` | `ref` | Hover over element |
| `scroll` | `direction`, `pixels?` | Scroll page |
| `wait` | `target` | Wait for selector or ms |

### Capture & Extraction (7)
| Command | Args | Description |
|---------|------|-------------|
| `screenshot` | `path?` | Take screenshot |
| `snapshot` | `interactive?`, `compact?` | Accessibility tree with refs |
| `eval` | `code` | Execute JavaScript |
| `get-text` | `ref?` | Extract visible text |
| `get-html` | `ref?` | Extract HTML |
| `get-url` | — | Get current URL |
| `pdf` | `path` | Export as PDF |

### Find Elements (3)
| Command | Args | Description |
|---------|------|-------------|
| `find-role` | `role`, `action`, `name?` | Find by ARIA role |
| `find-text` | `text`, `action` | Find by text content |
| `find-label` | `label`, `action`, `text?` | Find by label |

### Tabs, Cookies & Storage (5)
| Command | Args | Description |
|---------|------|-------------|
| `tabs` | — | List open tabs |
| `cookies-get` | `url?` | Get cookies |
| `cookies-set` | `name`, `value`, `domain?`, ... | Set cookie |
| `cookies-clear` | `url?` | Clear cookies |
| `storage` | `type`, `action?`, `key?`, `value?` | localStorage/sessionStorage |

### Debug & Inspect (8)
| Command | Args | Description |
|---------|------|-------------|
| `console` | `clear?` | View console logs |
| `errors` | `clear?` | View page errors |
| `network` | `filter?`, `clear?` | View network requests |
| `highlight` | `ref` | Highlight element |
| `trace-start` | `path?` | Start Chrome trace |
| `trace-stop` | — | Stop trace |
| `diff-snapshot` | — | Compare snapshots |
| `diff-screenshot` | `baseline` | Compare screenshots |

### Batch (1)
| Command | Args | Description |
|---------|------|-------------|
| `batch` | `commands`, `bail?` | Execute multiple commands |
