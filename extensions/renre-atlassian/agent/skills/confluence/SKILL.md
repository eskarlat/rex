---
name: confluence
description: Manages Confluence pages, comments, labels, users, analytics, and attachments. Use when user mentions Confluence pages, wikis, documentation, knowledge base, spaces, CQL queries, or asks to create/update/search wiki content.
---

# Confluence

## Overview

This skill provides 23 Confluence commands via the renre-atlassian CLI extension. All commands are invoked through RenreKit's CLI using the `renre-atlassian:` namespace.

## Quick Start

If you need to discover available commands and their arguments, run:
```
renre-kit renre-atlassian:confluence-help
```

## Prerequisites

- The renre-atlassian extension must be installed and configured:
  1. `renre-kit ext install renre-atlassian`
  2. `renre-kit ext config renre-atlassian --set domain=<company>.atlassian.net`
  3. `renre-kit ext config renre-atlassian --set email=<user@company.com>`
  4. `renre-kit vault set renre-atlassian.apiToken`
- API token from https://id.atlassian.com/manage-profile/security/api-tokens

## How to Invoke Commands

```
renre-kit renre-atlassian:{command-name} --{argName} "{value}"
```

## Key Commands

### Pages
- `renre-atlassian:confluence-search --cql "type = page AND space = DEV"`
- `renre-atlassian:confluence-get-page --pageId "123456"`
- `renre-atlassian:confluence-create-page --spaceKey "DEV" --title "Title" --body "<p>Content</p>"`
- `renre-atlassian:confluence-update-page --pageId "123456" --title "Title" --body "<p>New</p>" --version 5`
- `renre-atlassian:confluence-delete-page --pageId "123456"`

### Comments
- `renre-atlassian:confluence-add-comment --pageId "123456" --body "<p>Comment</p>"`

### Labels
- `renre-atlassian:confluence-add-label --pageId "123456" --labels '["api", "docs"]'`

## Required Workflow

1. **Discover commands**: `renre-kit renre-atlassian:confluence-help`
2. **Search existing content**: Always check for existing pages before creating
3. **Fetch before updating**: Get the current version number (optimistic locking)
4. **Confirm result**: Verify changes were applied

## Best Practices

- Always fetch page with `confluence-get-page` before `confluence-update-page` to get version
- Page bodies use Confluence storage format (XHTML): `<h1>`, `<p>`, `<ul><li>`
- CQL space keys are case-sensitive
- Confirm destructive actions with the user first
- For the full command reference: `renre-kit renre-atlassian:confluence-help`
