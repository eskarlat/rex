---
name: dom-inspection
description: Use this skill to inspect, query, and interact with web page DOM elements — get HTML, find elements by selector, click buttons, type into inputs, read computed styles, and check accessibility. Use when the user wants to examine page structure, interact with UI elements, or debug layout/accessibility issues.
---

# renre-devtools/dom-inspection

Inspect and interact with DOM elements in the browser. Requires a running browser (use `browser-control` skill to launch first).

## Commands

### renre-devtools:dom

Get the DOM tree or a subtree as HTML.

**Arguments:**

- `--selector <css>` — CSS selector to scope to a subtree (optional, defaults to full page)
- `--depth <number>` — Max nesting depth (default: 5)

**Examples:**

```
renre-kit renre-devtools:dom
renre-kit renre-devtools:dom --selector "main" --depth 3
renre-kit renre-devtools:dom --selector "#content"
```

### renre-devtools:select

Query elements by CSS selector and get a summary table.

**Arguments:**

- `--selector <css>` (required) — CSS selector

**Example:**

```
renre-kit renre-devtools:select --selector "a[href]"
renre-kit renre-devtools:select --selector ".error-message"
```

Returns: count, tag, id, classes, text content for each match.

### renre-devtools:click

Click an element.

**Arguments:**

- `--selector <css>` (required) — Element to click

**Example:**

```
renre-kit renre-devtools:click --selector "button.submit"
renre-kit renre-devtools:click --selector "#login-btn"
```

### renre-devtools:type

Type text into an input element.

**Arguments:**

- `--selector <css>` (required) — Input element selector
- `--text <string>` (required) — Text to type
- `--clear` (flag) — Clear the field first

**Example:**

```
renre-kit renre-devtools:type --selector "#search" --text "hello world"
renre-kit renre-devtools:type --selector "input[name='email']" --text "user@example.com" --clear
```

### renre-devtools:styles

Get computed CSS styles for an element.

**Arguments:**

- `--selector <css>` (required) — Element selector
- `--all` (flag) — Show all properties (default: key properties only)

**Example:**

```
renre-kit renre-devtools:styles --selector ".header"
renre-kit renre-devtools:styles --selector "#logo" --all
```

### renre-devtools:a11y

Get the accessibility tree.

**Arguments:**

- `--selector <css>` — Scope to element (optional)
- `--depth <number>` — Max depth (default: 5)

**Example:**

```
renre-kit renre-devtools:a11y
renre-kit renre-devtools:a11y --selector "nav"
```

## Tips

- Use `select` first to find elements, then `click`/`type` to interact
- Use `dom --depth 2` for a quick overview, increase depth for details
- Combine `styles` with `a11y` to debug both visual and semantic issues
