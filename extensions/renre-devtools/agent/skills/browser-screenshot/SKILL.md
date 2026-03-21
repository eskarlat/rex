---
name: browser-screenshot
description: Use this skill to capture screenshots of web pages or specific elements. Use for visual debugging, documenting page state, comparing before/after changes, or capturing evidence of issues.
---

# renre-devtools/browser-screenshot

Capture screenshots of the page or specific elements.

## Commands

### renre-devtools:screenshot

Take a screenshot.

**Arguments:**

- `--selector <css>` — Capture a specific element (optional, defaults to viewport)
- `--full-page` (flag) — Capture the full scrollable page
- `--output <path>` — Save path (default: `screenshot-{timestamp}.png` in project root)
- `--encoded` (flag) — Return as base64 data URI instead of saving to file

**Examples:**

Full viewport:

```
renre-kit renre-devtools:screenshot
```

Specific element:

```
renre-kit renre-devtools:screenshot --selector "nav.main-nav"
```

Full scrollable page:

```
renre-kit renre-devtools:screenshot --full-page --output "./debug/full-page.png"
```

Base64 for inline display:

```
renre-kit renre-devtools:screenshot --encoded
```

## Tips

- Take screenshots before and after changes to compare
- Use `--selector` to focus on specific components
- Use `--full-page` to capture content below the fold
- The `--output` path is relative to the project root
