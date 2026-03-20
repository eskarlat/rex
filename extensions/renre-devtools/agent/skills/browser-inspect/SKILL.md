---
name: browser-inspect
description: Use this skill to inspect web pages, execute JavaScript in the browser console, read DOM content, check page state, debug issues, and get console logs — e.g. "check the page title", "run this JavaScript", "get the page HTML", "inspect the DOM", "debug this page"
---

# renre-devtools/browser-inspect

Execute JavaScript in the browser, inspect DOM elements, read page content, and debug web applications using a live headed browser.

## Commands

### renre-devtools:puppeteer_evaluate
Execute JavaScript code in the browser console and return the result.

**Parameters:**
- `script` (string, required) — JavaScript code to execute in the browser context

**Examples:**

Get the page title:
```
renre-kit renre-devtools:puppeteer_evaluate --script "document.title"
```

Get all links on the page:
```
renre-kit renre-devtools:puppeteer_evaluate --script "JSON.stringify([...document.querySelectorAll('a')].map(a => ({text: a.textContent, href: a.href})))"
```

Check page performance:
```
renre-kit renre-devtools:puppeteer_evaluate --script "JSON.stringify(performance.timing)"
```

Read element text:
```
renre-kit renre-devtools:puppeteer_evaluate --script "document.querySelector('h1')?.textContent"
```

Get computed styles:
```
renre-kit renre-devtools:puppeteer_evaluate --script "JSON.stringify(getComputedStyle(document.querySelector('.element')))"
```

Check for errors in the DOM:
```
renre-kit renre-devtools:puppeteer_evaluate --script "document.querySelectorAll('[aria-invalid=\"true\"]').length"
```

## Resources

### console://logs
Access browser console output (log, warn, error messages) from the running browser session.

## Tips

- Always use `JSON.stringify()` when returning objects or arrays from `puppeteer_evaluate`
- Use optional chaining (`?.`) when querying elements that may not exist
- The browser runs in headed mode — the user can see what you are doing
- Combine with `browser-navigate` skill to navigate to a page before inspecting it
- Combine with `browser-screenshot` skill to capture visual evidence of issues
