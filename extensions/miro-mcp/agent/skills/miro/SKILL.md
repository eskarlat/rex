---
name: miro
description: Manages Miro boards, items, connectors, sticky notes, frames, documents, text, images, shapes, embeds, tags, members, groups, mindmaps, projects, exports, compliance, and organization via MCP (98 tools across 21 toolsets). Use when user mentions Miro boards, visual collaboration, sticky notes, diagrams, whiteboarding, or asks to create/update/manage board content. Requires Miro MCP server connection.
metadata:
  mcp-server: miro-mcp
---

# Miro

## Overview

This skill provides access to 98 Miro tools across 21 toolsets via the Miro MCP server. All tools are invoked through RenreKit's CLI using the `miro-mcp:{toolName}` namespace pattern.

## Prerequisites

- Miro MCP server must be connected and accessible
  - Before proceeding, verify the Miro MCP server is connected by checking if Miro MCP tools (e.g., `miro-mcp:miro_list_boards`) are available.
  - If the tools are not available, the Miro MCP server may not be enabled. Guide the user to enable and configure the extension:
    1. `renre-kit ext install miro-mcp`
    2. `renre-kit vault set miro-mcp.accessToken` (stores access token securely)
  - The user needs a Miro access token from https://miro.com/app/settings/user-profile/apps
- User should provide board IDs, item IDs, or describe what they want to do in Miro

## How to Invoke Tools

All Miro tools are called through `renre-kit` with the `miro-mcp:` prefix:

```
renre-kit miro-mcp:{toolName} --{argName} "{value}"
```

Arguments are passed as `--key "value"` flags. Object/array arguments are passed as JSON strings.

## Available Tools

### Boards — Board management (6 tools)

- **`miro-mcp:miro_list_boards`** — List all accessible boards.

  ```
  renre-kit miro-mcp:miro_list_boards
  renre-kit miro-mcp:miro_list_boards --query '{"limit": "10", "sort": "last_modified"}'
  ```

- **`miro-mcp:miro_create_board`** — Create a new board.

  ```
  renre-kit miro-mcp:miro_create_board --data '{"name": "Sprint Planning", "description": "Sprint 10 planning board"}'
  ```

- **`miro-mcp:miro_get_board`** — Get board details.

  ```
  renre-kit miro-mcp:miro_get_board --boardId "uXjVN1234567="
  ```

- **`miro-mcp:miro_update_board`** — Update board name or description.

  ```
  renre-kit miro-mcp:miro_update_board --boardId "uXjVN1234567=" --data '{"name": "Updated Board Name"}'
  ```

- **`miro-mcp:miro_delete_board`** — Delete a board.

  ```
  renre-kit miro-mcp:miro_delete_board --boardId "uXjVN1234567="
  ```

- **`miro-mcp:miro_copy_board`** — Copy a board.
  ```
  renre-kit miro-mcp:miro_copy_board --boardId "uXjVN1234567=" --data '{"name": "Board Copy"}'
  ```

### Items — Generic item operations (4 tools)

- **`miro-mcp:miro_get_items`** — Get all items on a board.

  ```
  renre-kit miro-mcp:miro_get_items --boardId "uXjVN1234567="
  renre-kit miro-mcp:miro_get_items --boardId "uXjVN1234567=" --query '{"type": "sticky_note", "limit": "50"}'
  ```

- **`miro-mcp:miro_get_item`** — Get a specific item.

  ```
  renre-kit miro-mcp:miro_get_item --boardId "uXjVN1234567=" --itemId "3458764513820541"
  ```

- **`miro-mcp:miro_update_item_position`** — Update item position on the board.

  ```
  renre-kit miro-mcp:miro_update_item_position --boardId "uXjVN1234567=" --itemId "3458764513820541" --data '{"position": {"x": 100, "y": 200}}'
  ```

- **`miro-mcp:miro_delete_item`** — Delete an item.
  ```
  renre-kit miro-mcp:miro_delete_item --boardId "uXjVN1234567=" --itemId "3458764513820541"
  ```

### Bulk — Batch item creation (2 tools)

- **`miro-mcp:miro_create_items_in_bulk`** — Create multiple items at once.

  ```
  renre-kit miro-mcp:miro_create_items_in_bulk --boardId "uXjVN1234567=" --items '[{"type": "sticky_note", "data": {"content": "Task 1"}}, {"type": "sticky_note", "data": {"content": "Task 2"}}]'
  ```

- **`miro-mcp:miro_create_items_in_bulk_using_file`** — Create items from a file upload.
  ```
  renre-kit miro-mcp:miro_create_items_in_bulk_using_file --boardId "uXjVN1234567=" --fileUrl "/path/to/items.csv"
  ```

### App Cards — Application card items (4 tools)

- **`miro-mcp:miro_create_app_card`** — Create an app card.

  ```
  renre-kit miro-mcp:miro_create_app_card --boardId "uXjVN1234567=" --data '{"data": {"title": "Task Card", "description": "Card description"}}'
  ```

- **`miro-mcp:miro_get_app_card`** — Get an app card.
- **`miro-mcp:miro_update_app_card`** — Update an app card.
- **`miro-mcp:miro_delete_app_card`** — Delete an app card.

### Cards — Card items (4 tools)

- **`miro-mcp:miro_create_card`** — Create a card.

  ```
  renre-kit miro-mcp:miro_create_card --boardId "uXjVN1234567=" --data '{"data": {"title": "Feature Card", "description": "Implementation details"}}'
  ```

- **`miro-mcp:miro_get_card`** — Get a card.
- **`miro-mcp:miro_update_card`** — Update a card.
- **`miro-mcp:miro_delete_card`** — Delete a card.

### Sticky Notes — Sticky note items (4 tools)

- **`miro-mcp:miro_create_sticky_note`** — Create a sticky note.

  ```
  renre-kit miro-mcp:miro_create_sticky_note --boardId "uXjVN1234567=" --data '{"data": {"content": "Remember to test edge cases"}, "style": {"fillColor": "yellow"}}'
  ```

- **`miro-mcp:miro_get_sticky_note`** — Get a sticky note.
- **`miro-mcp:miro_update_sticky_note`** — Update a sticky note.
- **`miro-mcp:miro_delete_sticky_note`** — Delete a sticky note.

### Frames — Frame containers (4 tools)

- **`miro-mcp:miro_create_frame`** — Create a frame.

  ```
  renre-kit miro-mcp:miro_create_frame --boardId "uXjVN1234567=" --data '{"data": {"title": "Sprint Backlog"}, "style": {"fillColor": "#f5f5f5"}}'
  ```

- **`miro-mcp:miro_get_frame`** — Get a frame.
- **`miro-mcp:miro_update_frame`** — Update a frame.
- **`miro-mcp:miro_delete_frame`** — Delete a frame.

### Documents — Document items (4 tools)

- **`miro-mcp:miro_create_document`** — Create a document.

  ```
  renre-kit miro-mcp:miro_create_document --boardId "uXjVN1234567=" --data '{"data": {"url": "https://docs.google.com/document/d/xxx"}}'
  ```

- **`miro-mcp:miro_get_document`** — Get a document.
- **`miro-mcp:miro_update_document`** — Update a document.
- **`miro-mcp:miro_delete_document`** — Delete a document.

### Text — Text items (4 tools)

- **`miro-mcp:miro_create_text`** — Create a text item.

  ```
  renre-kit miro-mcp:miro_create_text --boardId "uXjVN1234567=" --data '{"data": {"content": "<p>Hello World</p>"}, "position": {"x": 0, "y": 0}}'
  ```

- **`miro-mcp:miro_get_text`** — Get a text item.
- **`miro-mcp:miro_update_text`** — Update a text item.
- **`miro-mcp:miro_delete_text`** — Delete a text item.

### Images — Image items (7 tools)

- **`miro-mcp:miro_create_image_from_url`** — Create image from URL.

  ```
  renre-kit miro-mcp:miro_create_image_from_url --boardId "uXjVN1234567=" --data '{"data": {"url": "https://example.com/image.png"}, "position": {"x": 0, "y": 0}}'
  ```

- **`miro-mcp:miro_create_image_from_file`** — Upload image from file.

  ```
  renre-kit miro-mcp:miro_create_image_from_file --boardId "uXjVN1234567=" --fileUrl "/path/to/image.png"
  ```

- **`miro-mcp:miro_get_image`** — Get image details.
- **`miro-mcp:miro_update_image`** — Update image metadata.
- **`miro-mcp:miro_update_image_from_file`** — Replace image with new file.
- **`miro-mcp:miro_delete_image`** — Delete an image.
- **`miro-mcp:miro_list_images`** — List all images on a board.

### Shapes — Shape items (4 tools)

- **`miro-mcp:miro_create_shape`** — Create a shape.

  ```
  renre-kit miro-mcp:miro_create_shape --boardId "uXjVN1234567=" --data '{"data": {"shape": "rectangle", "content": "Box"}, "style": {"fillColor": "#ff0000"}}'
  ```

- **`miro-mcp:miro_get_shape`** — Get a shape.
- **`miro-mcp:miro_update_shape`** — Update a shape.
- **`miro-mcp:miro_delete_shape`** — Delete a shape.

### Embeds — Embedded content (4 tools)

- **`miro-mcp:miro_create_embed`** — Create an embed.

  ```
  renre-kit miro-mcp:miro_create_embed --boardId "uXjVN1234567=" --data '{"data": {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}'
  ```

- **`miro-mcp:miro_get_embed`** — Get an embed.
- **`miro-mcp:miro_update_embed`** — Update an embed.
- **`miro-mcp:miro_delete_embed`** — Delete an embed.

### Connectors — Visual connections between items (5 tools)

- **`miro-mcp:miro_list_connectors`** — List connectors on a board.

  ```
  renre-kit miro-mcp:miro_list_connectors --boardId "uXjVN1234567="
  ```

- **`miro-mcp:miro_create_connector`** — Create a connector between items.

  ```
  renre-kit miro-mcp:miro_create_connector --boardId "uXjVN1234567=" --data '{"startItem": {"id": "3458764513820541"}, "endItem": {"id": "3458764513820542"}, "style": {"strokeColor": "#000000"}}'
  ```

- **`miro-mcp:miro_get_connector`** — Get a connector.
- **`miro-mcp:miro_update_connector`** — Update a connector.
- **`miro-mcp:miro_delete_connector`** — Delete a connector.

### Tags — Item tagging and categorization (8 tools)

- **`miro-mcp:miro_list_tags`** — List all tags on a board.

  ```
  renre-kit miro-mcp:miro_list_tags --boardId "uXjVN1234567="
  ```

- **`miro-mcp:miro_create_tag`** — Create a tag.

  ```
  renre-kit miro-mcp:miro_create_tag --boardId "uXjVN1234567=" --data '{"title": "High Priority", "fillColor": "red"}'
  ```

- **`miro-mcp:miro_get_tag`** — Get a tag.
- **`miro-mcp:miro_update_tag`** — Update a tag.
- **`miro-mcp:miro_delete_tag`** — Delete a tag.

- **`miro-mcp:miro_attach_tag`** — Attach a tag to an item.

  ```
  renre-kit miro-mcp:miro_attach_tag --boardId "uXjVN1234567=" --itemId "3458764513820541" --tagId "3458764513820600"
  ```

- **`miro-mcp:miro_detach_tag`** — Remove a tag from an item.
- **`miro-mcp:miro_get_item_tags`** — Get all tags on an item.

### Members — Board membership management (5 tools)

- **`miro-mcp:miro_list_board_members`** — List board members.

  ```
  renre-kit miro-mcp:miro_list_board_members --boardId "uXjVN1234567="
  ```

- **`miro-mcp:miro_get_board_member`** — Get member details.
- **`miro-mcp:miro_update_board_member`** — Update member role.
- **`miro-mcp:miro_remove_board_member`** — Remove a member.

- **`miro-mcp:miro_share_board`** — Share board with users.
  ```
  renre-kit miro-mcp:miro_share_board --boardId "uXjVN1234567=" --data '{"emails": ["user@company.com"], "role": "editor"}'
  ```

### Groups — Item grouping (7 tools)

- **`miro-mcp:miro_list_groups`** — List groups on a board.
- **`miro-mcp:miro_get_group`** — Get a group.
- **`miro-mcp:miro_create_group`** — Create a group from items.

  ```
  renre-kit miro-mcp:miro_create_group --boardId "uXjVN1234567=" --data '{"itemIds": ["3458764513820541", "3458764513820542"]}'
  ```

- **`miro-mcp:miro_update_group`** — Update a group.
- **`miro-mcp:miro_delete_group`** — Delete a group.
- **`miro-mcp:miro_get_group_items`** — Get items in a group.
- **`miro-mcp:miro_ungroup_items`** — Ungroup all items in a group.

### Mindmaps — Mind map node management (4 tools)

- **`miro-mcp:miro_create_mindmap_node`** — Create a mindmap node.

  ```
  renre-kit miro-mcp:miro_create_mindmap_node --boardId "uXjVN1234567=" --data '{"nodeView": {"content": "Main Idea"}}'
  ```

- **`miro-mcp:miro_get_mindmap_node`** — Get a mindmap node.
- **`miro-mcp:miro_update_mindmap_node`** — Update a mindmap node.
- **`miro-mcp:miro_delete_mindmap_node`** — Delete a mindmap node.

### Projects — Organization project management (3 tools)

- **`miro-mcp:miro_list_project_members`** — List project members.

  ```
  renre-kit miro-mcp:miro_list_project_members --orgId "3074457345000000000" --projectId "3074457345000000001"
  ```

- **`miro-mcp:miro_get_project_member`** — Get a project member.
- **`miro-mcp:miro_update_project_member`** — Update a project member's role.

### Exports — Board export management (3 tools)

- **`miro-mcp:miro_create_export_job`** — Start a board export.

  ```
  renre-kit miro-mcp:miro_create_export_job --boardId "uXjVN1234567=" --data '{"format": "pdf"}'
  ```

- **`miro-mcp:miro_get_export_job_status`** — Check export job status.

  ```
  renre-kit miro-mcp:miro_get_export_job_status --boardId "uXjVN1234567=" --jobId "job-123"
  ```

- **`miro-mcp:miro_get_export_job_results`** — Get export results (download URLs).

### Compliance — Enterprise compliance management (8 tools)

- **`miro-mcp:miro_list_compliance_cases`** — List compliance cases.
- **`miro-mcp:miro_get_compliance_case`** — Get a compliance case.
- **`miro-mcp:miro_create_compliance_case`** — Create a compliance case.
- **`miro-mcp:miro_update_compliance_case`** — Update a compliance case.
- **`miro-mcp:miro_list_legal_holds`** — List legal holds.
- **`miro-mcp:miro_create_legal_hold`** — Create a legal hold.
- **`miro-mcp:miro_get_content_logs`** — Get content audit logs.
- **`miro-mcp:miro_get_content_classification`** — Get board content classification.

Note: Compliance tools require Enterprise-tier Miro tokens.

### Organization — Organization management (4 tools)

- **`miro-mcp:miro_get_organization`** — Get organization info.

  ```
  renre-kit miro-mcp:miro_get_organization --orgId "3074457345000000000"
  ```

- **`miro-mcp:miro_list_org_members`** — List organization members.
- **`miro-mcp:miro_get_org_member`** — Get an organization member.
- **`miro-mcp:miro_get_audit_logs`** — Get organization audit logs.

Note: Organization tools require Enterprise-tier Miro tokens.

## Required Workflow

**Follow these steps when working with Miro boards.**

### Step 1: Verify Connection

Check that the Miro MCP server is available. If not, guide the user through setup (see Prerequisites).

### Step 2: Gather Context

Before making changes, always fetch the current state first:

1. To find boards: use `miro-mcp:miro_list_boards`
2. To understand board contents: use `miro-mcp:miro_get_items` to list all items
3. To inspect a specific item: use `miro-mcp:miro_get_item`

### Step 3: Make Changes

Apply the requested changes (create items, update positions, add connectors, etc.).

### Step 4: Confirm Result

After making changes, fetch the updated item with the appropriate get tool to confirm the changes were applied successfully. Report the result to the user.

## Examples

### Example 1: Create a planning board with sticky notes

User says: "Create a new sprint planning board with 3 sticky notes for our top priorities"

**Actions:**

1. Create the board: `renre-kit miro-mcp:miro_create_board --data '{"name": "Sprint Planning", "description": "Sprint priorities"}'`
2. Note the board ID from the response (e.g., `uXjVN1234567=`)
3. Create sticky notes:
   ```
   renre-kit miro-mcp:miro_create_sticky_note --boardId "uXjVN1234567=" --data '{"data": {"content": "Priority 1: Auth module"}, "position": {"x": 0, "y": 0}}'
   renre-kit miro-mcp:miro_create_sticky_note --boardId "uXjVN1234567=" --data '{"data": {"content": "Priority 2: API endpoints"}, "position": {"x": 300, "y": 0}}'
   renre-kit miro-mcp:miro_create_sticky_note --boardId "uXjVN1234567=" --data '{"data": {"content": "Priority 3: Testing"}, "position": {"x": 600, "y": 0}}'
   ```
4. Report the board URL to the user

### Example 2: Connect items with a flow

User says: "Create a connector from item A to item B on my board"

**Actions:**

1. Get items to find IDs: `renre-kit miro-mcp:miro_get_items --boardId "uXjVN1234567="`
2. Create connector: `renre-kit miro-mcp:miro_create_connector --boardId "uXjVN1234567=" --data '{"startItem": {"id": "itemA-id"}, "endItem": {"id": "itemB-id"}}'`
3. Verify: `renre-kit miro-mcp:miro_list_connectors --boardId "uXjVN1234567="`

### Example 3: Tag and organize items

User says: "Tag all the items in group X as 'High Priority'"

**Actions:**

1. Create the tag: `renre-kit miro-mcp:miro_create_tag --boardId "uXjVN1234567=" --data '{"title": "High Priority", "fillColor": "red"}'`
2. Get group items: `renre-kit miro-mcp:miro_get_group_items --boardId "uXjVN1234567=" --groupId "group-id"`
3. Attach the tag to each item: `renre-kit miro-mcp:miro_attach_tag --boardId "uXjVN1234567=" --itemId "item-id" --tagId "tag-id"`
4. Report how many items were tagged

### Example 4: Export a board

User says: "Export this board as a PDF"

**Actions:**

1. Start export: `renre-kit miro-mcp:miro_create_export_job --boardId "uXjVN1234567=" --data '{"format": "pdf"}'`
2. Check status: `renre-kit miro-mcp:miro_get_export_job_status --boardId "uXjVN1234567=" --jobId "job-123"`
3. Get results: `renre-kit miro-mcp:miro_get_export_job_results --boardId "uXjVN1234567=" --jobId "job-123"`
4. Share the download URL with the user

## Best Practices

### Always Fetch Before Mutating

Never assume the current state of a board or item. Always use get/list tools before updating or deleting.

### Use Bulk Operations

When creating multiple items, prefer `miro_create_items_in_bulk` over individual create calls — it's faster and uses fewer API calls.

### Position Items Thoughtfully

When creating multiple items, space them out using the `position` property to avoid overlapping. A good default spacing is 300px between items.

### Confirm Destructive Actions

Before deleting boards, items, or removing members, confirm with the user. These actions may not be reversible.

## Common Issues and Solutions

### Issue: "Missing Miro configuration" error

**Cause:** The access token is not configured.
**Solution:** Guide the user to configure the extension:

```
renre-kit vault set miro-mcp.accessToken
```

### Issue: 401 Unauthorized

**Cause:** Invalid or expired access token.
**Solution:** Verify the access token is valid. Tokens can be generated at https://miro.com/app/settings/user-profile/apps.

### Issue: 403 Forbidden on compliance/organization tools

**Cause:** The user's Miro plan doesn't include Enterprise features.
**Solution:** Inform the user that compliance and organization tools require an Enterprise-tier Miro subscription.

### Issue: 429 Rate Limited

**Cause:** Too many API requests in a short period.
**Solution:** Wait a moment and retry. Use bulk operations to reduce the number of API calls.
