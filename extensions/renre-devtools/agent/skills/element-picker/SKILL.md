---
name: element-picker
description: Use this skill when the user wants to point at, select, or pick a specific element in the browser for you to inspect, edit, style, click, or interact with. This enables a visual workflow where the user selects an element in the browser and you get full details about it. Also use when you need to highlight an element to confirm with the user, or retrieve details about a previously selected element.
---

# renre-devtools/element-picker

Let the user visually select an element in the browser, then get full details (selector, HTML, styles, attributes, accessibility info) for the agent to act on.

## Workflow

1. Agent runs `renre-devtools:inspect` — browser enters picker mode (blue highlight on hover)
2. User clicks the element they want
3. Command returns: CSS selector, tag, size, text, attributes, styles, HTML
4. Agent uses the returned selector with other commands (`click`, `type`, `styles`, `dom`, etc.)

## Commands

### renre-devtools:inspect

Activate the element picker. The browser will highlight elements as the user hovers over them. When the user clicks an element, the command returns full details.

**Arguments:**

- `--timeout <number>` — Max wait time in ms for user to click (default: 30000)

**Example:**

```
renre-kit renre-devtools:inspect
renre-kit renre-devtools:inspect --timeout 60000
```

**Returns:**

- Tag name, generated CSS selector
- Element size, position, visibility
- All HTML attributes
- Key computed styles (display, position, color, font, etc.)
- Trimmed outer HTML
- Accessibility role and name
- Suggested next commands using the generated selector

### renre-devtools:selected

Get details about the last element picked with `inspect`. Useful when the user says "that element" or "the one I selected" — no need to re-pick.

**Example:**

```
renre-kit renre-devtools:selected
```

### renre-devtools:highlight

Visually highlight an element in the browser so the user can confirm it's the right one.

**Arguments:**

- `--selector <css>` (required) — Element to highlight
- `--duration <number>` — How long to highlight in ms (default: 3000)

**Example:**

```
renre-kit renre-devtools:highlight --selector ".main-header"
renre-kit renre-devtools:highlight --selector "#submit-btn" --duration 5000
```

## Typical Conversations

**User: "Inspect this element" / "I'll point to it"**

```
renre-kit renre-devtools:inspect
```
→ User clicks element in browser → agent receives selector + details

**User: "Change the color of that button"**

```
renre-kit renre-devtools:selected
```
→ Get the selector from last inspection → then:
```
renre-kit renre-devtools:eval --code "document.querySelector('.the-selector').style.color = 'red'"
```

**User: "Is this the right element?"**

```
renre-kit renre-devtools:highlight --selector ".the-selector"
```
→ Element flashes in browser → user confirms visually

**User: "What are the styles on this?"**

```
renre-kit renre-devtools:inspect
```
→ User clicks → agent gets selector → then:
```
renre-kit renre-devtools:styles --selector ".the-selector" --all
```

## Tips

- Always use `inspect` when the user refers to a visual element ("this button", "that section")
- Use `highlight` to confirm with the user before making changes
- The generated CSS selector is unique to the element and can be used with all other commands
- `selected` remembers the last picked element across commands — no need to re-pick
- If the page changes (navigation, SPA route change), the selector may become stale — re-inspect
