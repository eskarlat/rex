---
name: browser-screenshot
description: Use this skill to take screenshots of web pages or specific elements for visual debugging, testing, and documentation — e.g. "take a screenshot", "capture the page", "show me what the page looks like", "screenshot the header"
---

# renre-devtools/browser-screenshot

Capture screenshots of the entire page or specific elements in the headed Puppeteer browser. Useful for visual regression testing, debugging layout issues, and documenting page state.

## Commands

### renre-devtools:puppeteer_screenshot

Take a screenshot of the current page or a specific element.

**Parameters:**

- `name` (string, required) — A descriptive name for the screenshot
- `selector` (string, optional) — CSS selector to capture a specific element. If omitted, captures the full page.
- `width` (number, optional) — Viewport width in pixels
- `height` (number, optional) — Viewport height in pixels
- `encoded` (boolean, optional) — If true, return as base64-encoded data URI text instead of binary. Default: false.

**Examples:**

Full page screenshot:

```
renre-kit renre-devtools:puppeteer_screenshot --name "homepage"
```

Screenshot of a specific element:

```
renre-kit renre-devtools:puppeteer_screenshot --name "nav-bar" --selector "nav.main-navigation"
```

Screenshot with custom viewport:

```
renre-kit renre-devtools:puppeteer_screenshot --name "mobile-view" --width 375 --height 812
```

Screenshot as base64 for inline display:

```
renre-kit renre-devtools:puppeteer_screenshot --name "debug-capture" --encoded true
```

## Resources

### screenshot://<name>

Retrieve a previously captured screenshot by its name. Use the same name you passed to `puppeteer_screenshot`.

## Tips

- Take a screenshot before and after changes to compare visual differences
- Use `selector` to focus on specific components for targeted debugging
- Set `width`/`height` to test responsive layouts at different breakpoints
- Use `encoded: true` when you need to display the screenshot inline
- Common responsive breakpoints: 375x812 (mobile), 768x1024 (tablet), 1280x720 (desktop)
