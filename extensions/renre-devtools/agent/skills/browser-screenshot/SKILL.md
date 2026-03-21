---
name: browser-screenshot
description: Use this skill to capture, manage, list, view, and delete screenshots of web pages or specific elements. Use for visual debugging, documenting page state, comparing before/after changes, capturing evidence of issues, or managing a gallery of screenshots.
---

# renre-devtools/browser-screenshot

Capture screenshots of the page or specific elements, and manage a persistent screenshot gallery.

## Commands

### renre-devtools:screenshot

Take a screenshot and save it to the screenshots directory.

**Arguments:**

- `--selector <css>` — Capture a specific element (optional, defaults to viewport)
- `--full-page` (flag) — Capture the full scrollable page
- `--output <path>` — Custom save path (default: screenshots directory with timestamp name)
- `--dir <path>` — Custom screenshots directory
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

**Notes:**
- Screenshots are automatically registered in metadata (`.renre-kit/storage/renre-devtools/screenshots/screenshots.jsonl`)
- Default save directory: `.renre-kit/storage/renre-devtools/screenshots/`
- Metadata includes: filename, path, timestamp, URL at time of capture, selector used

### renre-devtools:screenshot-list

List all saved screenshots with metadata.

**Example:**

```
renre-kit renre-devtools:screenshot-list
```

**Returns (JSON):** `{ screenshots: [{ filename, path, timestamp, url, selector, fullPage }] }`

Only includes screenshots whose files still exist on disk.

### renre-devtools:screenshot-read

Read a saved screenshot as a base64 data URL for display.

**Arguments:**

- `--path <string>` (required) — Absolute path to the screenshot file

**Example:**

```
renre-kit renre-devtools:screenshot-read --path "/project/.renre-kit/storage/renre-devtools/screenshots/screenshot-1234.png"
```

**Returns (JSON):** `{ dataUrl: "data:image/png;base64,..." }`

### renre-devtools:screenshot-delete

Delete a screenshot file and remove it from metadata.

**Arguments:**

- `--path <string>` (required) — Absolute path to the screenshot to delete

**Example:**

```
renre-kit renre-devtools:screenshot-delete --path "/project/.renre-kit/storage/renre-devtools/screenshots/screenshot-1234.png"
```

## Tips

- Take screenshots before and after changes to compare
- Use `--selector` to focus on specific components
- Use `--full-page` to capture content below the fold
- Use `screenshot-list` to see all saved screenshots
- Use `screenshot-read` to view screenshots as base64 (useful in chat/LLM context)
- Screenshots persist across browser sessions — they're saved to disk
