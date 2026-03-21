---
name: javascript-execution
description: Use this skill to execute JavaScript code in the browser, read console output, and debug web applications. Use when the user wants to run scripts, check values, manipulate the page programmatically, read browser console messages, or clear log output.
---

# chrome-debugger/javascript-execution

Execute JavaScript in the browser context and capture console output.

## Commands

### chrome-debugger:eval

Execute JavaScript code in the page context and return the result.

**Arguments:**

- `--code <string>` — JavaScript code to execute
- `--file <path>` — Path to a JS file to execute (alternative to --code)

**Examples:**

Get page title:

```
renre-kit chrome-debugger:eval --code "document.title"
```

Get all links:

```
renre-kit chrome-debugger:eval --code "JSON.stringify([...document.querySelectorAll('a')].map(a => ({text: a.textContent?.trim(), href: a.href})))"
```

Check localStorage:

```
renre-kit chrome-debugger:eval --code "JSON.stringify(Object.fromEntries(Object.entries(localStorage)))"
```

Modify DOM:

```
renre-kit chrome-debugger:eval --code "document.querySelector('h1').textContent = 'Modified'"
```

Run a file:

```
renre-kit chrome-debugger:eval --file ./scripts/test-page.js
```

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

### chrome-debugger:clear-logs

Clear all captured console and network log files. Useful when starting a new debugging session.

**Example:**

```
renre-kit chrome-debugger:clear-logs
```

## Tips

- Always use `JSON.stringify()` when returning objects or arrays from `eval`
- Use optional chaining (`?.`) when querying elements that may not exist
- Console messages are captured from the moment the browser launches
- Use `eval` to inject custom logging, then read with `console`
- Use `--format json` for programmatic processing in LLM workflows
- Use `clear-logs` before a test run to get clean console output
