---
name: browser-navigate
description: Use this skill to navigate a browser to URLs, click links, fill forms, select options, and hover over elements — e.g. "open this website", "go to the login page", "fill in the search field", "click the submit button"
---

# renre-devtools/browser-navigate

Control a headed Puppeteer browser for web navigation and page interaction. The browser window is visible so the user can watch in real time.

## Commands

### renre-devtools:puppeteer_navigate

Navigate the browser to a URL.

**Parameters:**

- `url` (string, required) — The URL to navigate to

**Example:**

```
renre-kit renre-devtools:puppeteer_navigate --url "https://example.com"
```

### renre-devtools:puppeteer_click

Click an element on the page using a CSS selector.

**Parameters:**

- `selector` (string, required) — CSS selector of the element to click

**Example:**

```
renre-kit renre-devtools:puppeteer_click --selector "button.submit"
```

### renre-devtools:puppeteer_fill

Fill an input field with text.

**Parameters:**

- `selector` (string, required) — CSS selector of the input element
- `value` (string, required) — Text to type into the field

**Example:**

```
renre-kit renre-devtools:puppeteer_fill --selector "#search-input" --value "hello world"
```

### renre-devtools:puppeteer_select

Select an option from a `<select>` element.

**Parameters:**

- `selector` (string, required) — CSS selector of the select element
- `value` (string, required) — Value of the option to select

**Example:**

```
renre-kit renre-devtools:puppeteer_select --selector "#country" --value "US"
```

### renre-devtools:puppeteer_hover

Hover over an element on the page.

**Parameters:**

- `selector` (string, required) — CSS selector of the element to hover

**Example:**

```
renre-kit renre-devtools:puppeteer_hover --selector ".dropdown-trigger"
```
