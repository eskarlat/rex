---
name: confluence
description: Manages Confluence pages, comments, labels, users, analytics, and attachments via MCP. Use when user mentions Confluence pages, wikis, documentation, knowledge base, spaces, CQL queries, or asks to create/update/search wiki content. Requires Atlassian MCP server connection.
metadata:
  mcp-server: atlassian-mcp
---

# Confluence

## Overview

This skill provides access to 23 Confluence tools across 6 toolsets via the Atlassian MCP server. All tools are invoked through RenreKit's CLI using the `atlassian-mcp:{toolName}` namespace pattern.

## Prerequisites

- Atlassian MCP server must be connected and accessible
  - Before proceeding, verify the Atlassian MCP server is connected by checking if Atlassian MCP tools (e.g., `atlassian-mcp:confluence_search`) are available.
  - If the tools are not available, the Atlassian MCP server may not be enabled. Guide the user to enable and configure the extension:
    1. `renre-kit ext install atlassian-mcp`
    2. `renre-kit ext config atlassian-mcp --set domain=<company>.atlassian.net`
    3. `renre-kit ext config atlassian-mcp --set email=<user@company.com>`
    4. `renre-kit vault set atlassian-mcp.apiToken` (stores API token securely)
  - The user needs an Atlassian API token from https://id.atlassian.com/manage-profile/security/api-tokens
- User should provide page IDs, space keys, or describe what content they want to find/create

## How to Invoke Tools

All Confluence tools are called through `renre-kit` with the `atlassian-mcp:` prefix:

```
renre-kit atlassian-mcp:{toolName} --{argName} "{value}"
```

Arguments are passed as `--key "value"` flags. Object/array arguments are passed as JSON strings.

## Available Tools

### Pages — Search, read, create, update, and manage pages

- **`atlassian-mcp:confluence_search`** — Search Confluence content using CQL (Confluence Query Language).

  ```
  renre-kit atlassian-mcp:confluence_search --cql "type = page AND space = DEV AND title ~ 'API'"
  renre-kit atlassian-mcp:confluence_search --cql "lastModified >= now('-7d') ORDER BY lastModified DESC" --limit 10
  ```

- **`atlassian-mcp:confluence_get_page`** — Get a page by ID with full content.

  ```
  renre-kit atlassian-mcp:confluence_get_page --pageId "123456"
  renre-kit atlassian-mcp:confluence_get_page --pageId "123456" --expand "body.storage,version,ancestors"
  ```

- **`atlassian-mcp:confluence_get_page_children`** — Get child pages under a parent.

  ```
  renre-kit atlassian-mcp:confluence_get_page_children --pageId "123456"
  ```

- **`atlassian-mcp:confluence_get_page_history`** — Get version history of a page.

  ```
  renre-kit atlassian-mcp:confluence_get_page_history --pageId "123456"
  ```

- **`atlassian-mcp:confluence_create_page`** — Create a new page in a space.

  ```
  renre-kit atlassian-mcp:confluence_create_page --spaceKey "DEV" --title "API Reference" --body "<h1>API Reference</h1><p>Documentation for the REST API.</p>"
  renre-kit atlassian-mcp:confluence_create_page --spaceKey "DEV" --title "Auth Guide" --body "<p>How to authenticate.</p>" --parentId "123456"
  ```

- **`atlassian-mcp:confluence_update_page`** — Update an existing page's title and content.

  ```
  renre-kit atlassian-mcp:confluence_update_page --pageId "123456" --title "Updated API Reference" --body "<h1>API Reference v2</h1><p>Updated documentation.</p>" --version 5
  ```

- **`atlassian-mcp:confluence_delete_page`** — Delete a page.

  ```
  renre-kit atlassian-mcp:confluence_delete_page --pageId "123456"
  ```

- **`atlassian-mcp:confluence_move_page`** — Move a page under a different parent.

  ```
  renre-kit atlassian-mcp:confluence_move_page --pageId "123456" --targetAncestorId "789012" --currentVersion 5
  ```

- **`atlassian-mcp:confluence_get_page_diff`** — Compare two versions of a page.
  ```
  renre-kit atlassian-mcp:confluence_get_page_diff --pageId "123456" --fromVersion 3 --toVersion 5
  ```

### Comments — Page discussions

- **`atlassian-mcp:confluence_get_comments`** — Get comments on a page.

  ```
  renre-kit atlassian-mcp:confluence_get_comments --pageId "123456"
  ```

- **`atlassian-mcp:confluence_add_comment`** — Add a comment to a page.

  ```
  renre-kit atlassian-mcp:confluence_add_comment --pageId "123456" --body "<p>This section needs updating for v2.</p>"
  ```

- **`atlassian-mcp:confluence_reply_to_comment`** — Reply to an existing comment.
  ```
  renre-kit atlassian-mcp:confluence_reply_to_comment --pageId "123456" --parentCommentId "789" --body "<p>Agreed, I'll update it this week.</p>"
  ```

### Labels — Content categorization

- **`atlassian-mcp:confluence_get_labels`** — Get labels on a page.

  ```
  renre-kit atlassian-mcp:confluence_get_labels --pageId "123456"
  ```

- **`atlassian-mcp:confluence_add_label`** — Add labels to a page.
  ```
  renre-kit atlassian-mcp:confluence_add_label --pageId "123456" --labels '["api", "documentation", "v2"]'
  ```

### Users — User lookup

- **`atlassian-mcp:confluence_search_user`** — Search for a Confluence user by name.
  ```
  renre-kit atlassian-mcp:confluence_search_user --query "Jane Smith"
  ```

### Analytics — Page view statistics

- **`atlassian-mcp:confluence_get_page_views`** — Get view statistics for a page.
  ```
  renre-kit atlassian-mcp:confluence_get_page_views --pageId "123456"
  ```

### Attachments — File management on pages

- **`atlassian-mcp:confluence_upload_attachment`** — Upload a file to a page.

  ```
  renre-kit atlassian-mcp:confluence_upload_attachment --pageId "123456" --filename "diagram.png" --content "<base64-content>"
  ```

- **`atlassian-mcp:confluence_upload_attachments`** — Upload multiple files.

  ```
  renre-kit atlassian-mcp:confluence_upload_attachments --pageId "123456" --files '[{"filename": "file1.txt", "content": "text"}, {"filename": "file2.txt", "content": "text"}]'
  ```

- **`atlassian-mcp:confluence_get_attachments`** — List all attachments on a page.

  ```
  renre-kit atlassian-mcp:confluence_get_attachments --pageId "123456"
  ```

- **`atlassian-mcp:confluence_download_attachment`** — Download an attachment by filename.

  ```
  renre-kit atlassian-mcp:confluence_download_attachment --pageId "123456" --filename "diagram.png"
  ```

- **`atlassian-mcp:confluence_download_content_attachments`** — Download all attachments from a page.

  ```
  renre-kit atlassian-mcp:confluence_download_content_attachments --pageId "123456"
  ```

- **`atlassian-mcp:confluence_delete_attachment`** — Delete an attachment.

  ```
  renre-kit atlassian-mcp:confluence_delete_attachment --attachmentId "att789"
  ```

- **`atlassian-mcp:confluence_get_page_images`** — Get only image attachments from a page.
  ```
  renre-kit atlassian-mcp:confluence_get_page_images --pageId "123456"
  ```

## Required Workflow

**Follow these steps when working with Confluence content.**

### Step 1: Verify Connection

Check that the Atlassian MCP server is available. If not, guide the user through setup (see Prerequisites).

### Step 2: Find Existing Content

Before creating new pages, always search for existing content first to avoid duplicates:

1. Use `atlassian-mcp:confluence_search` with CQL to find relevant pages
2. Use `atlassian-mcp:confluence_get_page` to read the full content of a specific page
3. Use `atlassian-mcp:confluence_get_page_children` to understand page hierarchy

### Step 3: Make Changes

Apply the requested changes (create, update, comment, label, etc.).

**Important for updates:** Confluence uses optimistic locking. You must provide the current `version` number when updating a page. Always fetch the page first with `confluence_get_page` to get the current version.

### Step 4: Confirm Result

After making changes, fetch the updated page with `atlassian-mcp:confluence_get_page` to confirm changes were applied. Report the result to the user.

## Examples

### Example 1: Create documentation for a new feature

User says: "Create a Confluence page documenting our new authentication API in the DEV space"

**Actions:**

1. Search for existing auth docs: `renre-kit atlassian-mcp:confluence_search --cql "type = page AND space = DEV AND title ~ 'authentication'"`
2. If no existing page, create one:
   ```
   renre-kit atlassian-mcp:confluence_create_page --spaceKey "DEV" --title "Authentication API" --body "<h1>Authentication API</h1><h2>Overview</h2><p>This document describes the authentication endpoints...</p><h2>Endpoints</h2><h3>POST /auth/login</h3><p>Authenticates a user and returns a JWT token.</p>"
   ```
3. Add labels: `renre-kit atlassian-mcp:confluence_add_label --pageId "<new-page-id>" --labels '["api", "authentication", "v2"]'`
4. Report the new page to the user

### Example 2: Update an existing page

User says: "Update the API docs page 123456 to include the new /users endpoint"

**Actions:**

1. Fetch current page: `renre-kit atlassian-mcp:confluence_get_page --pageId "123456"`
2. Note the current version number and body content from the response
3. Append the new section to the existing body content
4. Update: `renre-kit atlassian-mcp:confluence_update_page --pageId "123456" --title "API Reference" --body "<existing-content><h3>GET /users</h3><p>Returns a list of users.</p>" --version 5`
5. Verify: `renre-kit atlassian-mcp:confluence_get_page --pageId "123456"`

### Example 3: Find recently modified documentation

User says: "What documentation has been updated in the last week?"

**Actions:**

1. Search recent changes: `renre-kit atlassian-mcp:confluence_search --cql "lastModified >= now('-7d') ORDER BY lastModified DESC" --limit 20`
2. Summarize the results for the user (page titles, spaces, who modified, when)

### Example 4: Review page changes

User says: "What changed in page 123456 between version 3 and version 5?"

**Actions:**

1. Get the diff: `renre-kit atlassian-mcp:confluence_get_page_diff --pageId "123456" --fromVersion 3 --toVersion 5`
2. Analyze the `from` and `to` content in the response
3. Summarize the changes to the user

## Best Practices

### Always Fetch Before Updating

Confluence requires the current version number for updates (optimistic locking). Always call `confluence_get_page` before `confluence_update_page` to get the correct version.

### Use CQL Effectively

CQL is powerful for finding content. Common patterns:

- `type = page AND space = DEV` — all pages in a space
- `title ~ "API"` — title contains "API"
- `label = "architecture"` — pages with specific label
- `lastModified >= now("-7d")` — recently modified
- `contributor = currentUser()` — pages the current user has edited
- `ancestor = 123456` — all descendants of a page

### Use Confluence Storage Format

Page bodies use Confluence storage format (XHTML-like). Common elements:

- `<h1>`, `<h2>`, `<h3>` for headings
- `<p>` for paragraphs
- `<ul><li>` for lists
- `<ac:structured-macro>` for macros (code blocks, panels, etc.)
- `<ac:link>` for internal links

### Confirm Destructive Actions

Before deleting pages or attachments, confirm with the user. Deleted pages go to the space trash but may be harder to recover.

### Organize with Labels

When creating pages, always suggest adding relevant labels to improve discoverability.

## Common Issues and Solutions

### Issue: "Missing Atlassian configuration" error

**Cause:** The extension's domain, email, or API token is not configured.
**Solution:** Guide the user to configure the extension:

```
renre-kit ext config atlassian-mcp --set domain=company.atlassian.net
renre-kit ext config atlassian-mcp --set email=user@company.com
renre-kit vault set atlassian-mcp.apiToken
```

### Issue: 409 Conflict on page update

**Cause:** The version number provided doesn't match the current version (someone else edited the page).
**Solution:** Re-fetch the page with `confluence_get_page` to get the latest version, then retry the update with the correct version number.

### Issue: 404 Not Found for a page ID

**Cause:** The page ID is incorrect, or the page has been deleted or moved.
**Solution:** Use `confluence_search` to find the page by title or content instead.

### Issue: CQL query returns no results

**Cause:** Incorrect space key, field name, or CQL syntax.
**Solution:** Try broader searches first (e.g., just `type = page AND space = DEV`) and narrow down. Space keys are case-sensitive.
