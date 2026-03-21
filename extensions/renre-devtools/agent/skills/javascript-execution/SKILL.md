---
name: javascript-execution
description: Use this skill to execute JavaScript code in the browser, read console output, and debug web applications. Use when the user wants to run scripts, check values, manipulate the page programmatically, or read browser console messages.
---

# renre-devtools/javascript-execution

Execute JavaScript in the browser context and capture console output.

## Commands

### renre-devtools:eval

Execute JavaScript code in the page context and return the result.

**Arguments:**

- `--code <string>` — JavaScript code to execute
- `--file <path>` — Path to a JS file to execute (alternative to --code)

**Examples:**

Get page title:

```
renre-kit renre-devtools:eval --code "document.title"
```

Get all links:

```
renre-kit renre-devtools:eval --code "JSON.stringify([...document.querySelectorAll('a')].map(a => ({text: a.textContent?.trim(), href: a.href})))"
```

Check localStorage:

```
renre-kit renre-devtools:eval --code "JSON.stringify(Object.fromEntries(Object.entries(localStorage)))"
```

Modify DOM:

```
renre-kit renre-devtools:eval --code "document.querySelector('h1').textContent = 'Modified'"
```

Run a file:

```
renre-kit renre-devtools:eval --file ./scripts/test-page.js
```

### renre-devtools:console

Show captured console messages from the browser.

**Arguments:**

- `--level <string>` — Filter by level: log, warn, error, info, debug
- `--limit <number>` — Max messages to show (default: 50)

**Examples:**

```
renre-kit renre-devtools:console
renre-kit renre-devtools:console --level error
renre-kit renre-devtools:console --level warn --limit 10
```

## Tips

- Always use `JSON.stringify()` when returning objects or arrays from `eval`
- Use optional chaining (`?.`) when querying elements that may not exist
- Console messages are captured from the moment the browser launches
- Use `eval` to inject custom logging, then read with `console`
