---
name: jira
description: Manages Jira issues, sprints, boards, projects, worklogs, comments, transitions, links, watchers, service desk queues, forms, metrics, and development info via MCP. Use when user mentions Jira issues, sprints, boards, backlogs, JQL queries, issue keys (e.g., PROJ-123), or asks to create/update/search issues. Requires Atlassian MCP server connection.
metadata:
  mcp-server: atlassian-mcp
---

# Jira

## Overview

This skill provides access to 49 Jira tools across 15 toolsets via the Atlassian MCP server. All tools are invoked through RenreKit's CLI using the `atlassian-mcp:{toolName}` namespace pattern.

## Prerequisites

- Atlassian MCP server must be connected and accessible
  - Before proceeding, verify the Atlassian MCP server is connected by checking if Atlassian MCP tools (e.g., `atlassian-mcp:jira_search`) are available.
  - If the tools are not available, the Atlassian MCP server may not be enabled. Guide the user to enable and configure the extension:
    1. `renre-kit ext install atlassian-mcp`
    2. `renre-kit ext config atlassian-mcp --set domain=<company>.atlassian.net`
    3. `renre-kit ext config atlassian-mcp --set email=<user@company.com>`
    4. `renre-kit vault set atlassian-mcp.apiToken` (stores API token securely)
  - The user needs an Atlassian API token from https://id.atlassian.com/manage-profile/security/api-tokens
- User should provide issue keys (e.g., `PROJ-123`), project keys, or describe what they want to do in Jira

## How to Invoke Tools

All Jira tools are called through `renre-kit` with the `atlassian-mcp:` prefix:

```
renre-kit atlassian-mcp:{toolName} --{argName} "{value}"
```

Arguments are passed as `--key "value"` flags. Object/array arguments are passed as JSON strings.

## Available Tools

### Issues — CRUD operations and search

- **`atlassian-mcp:jira_get_issue`** — Get a single issue by key.

  ```
  renre-kit atlassian-mcp:jira_get_issue --issueKey "PROJ-123"
  renre-kit atlassian-mcp:jira_get_issue --issueKey "PROJ-123" --expand "changelog,renderedFields"
  ```

- **`atlassian-mcp:jira_search`** — Search issues using JQL (Jira Query Language).

  ```
  renre-kit atlassian-mcp:jira_search --jql "project = PROJ AND status = 'In Progress'"
  renre-kit atlassian-mcp:jira_search --jql "assignee = currentUser() ORDER BY updated DESC" --maxResults 20
  ```

- **`atlassian-mcp:jira_get_project_issues`** — Get all issues for a project.

  ```
  renre-kit atlassian-mcp:jira_get_project_issues --projectKey "PROJ"
  ```

- **`atlassian-mcp:jira_create_issue`** — Create a new issue.

  ```
  renre-kit atlassian-mcp:jira_create_issue --projectKey "PROJ" --issueType "Task" --summary "Implement login page" --description "Build the login page per the Figma design"
  ```

- **`atlassian-mcp:jira_update_issue`** — Update issue fields.

  ```
  renre-kit atlassian-mcp:jira_update_issue --issueKey "PROJ-123" --fields '{"summary": "Updated title", "priority": {"name": "High"}}'
  ```

- **`atlassian-mcp:jira_delete_issue`** — Delete an issue.

  ```
  renre-kit atlassian-mcp:jira_delete_issue --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_batch_create_issues`** — Create multiple issues at once.

  ```
  renre-kit atlassian-mcp:jira_batch_create_issues --issues '[{"fields": {"project": {"key": "PROJ"}, "issuetype": {"name": "Task"}, "summary": "Task 1"}}, {"fields": {"project": {"key": "PROJ"}, "issuetype": {"name": "Task"}, "summary": "Task 2"}}]'
  ```

- **`atlassian-mcp:jira_batch_get_changelogs`** — Get the change history of an issue.
  ```
  renre-kit atlassian-mcp:jira_batch_get_changelogs --issueKey "PROJ-123"
  ```

### Fields — Discover available fields and their options

- **`atlassian-mcp:jira_search_fields`** — List all available fields (system and custom). No args.

  ```
  renre-kit atlassian-mcp:jira_search_fields
  ```

- **`atlassian-mcp:jira_get_field_options`** — Get options for a custom field.
  ```
  renre-kit atlassian-mcp:jira_get_field_options --fieldId "customfield_10001" --contextId "10100"
  ```

### Comments — Add and edit issue comments

- **`atlassian-mcp:jira_add_comment`** — Add a comment to an issue.

  ```
  renre-kit atlassian-mcp:jira_add_comment --issueKey "PROJ-123" --body "Implementation complete. Ready for review."
  ```

- **`atlassian-mcp:jira_edit_comment`** — Edit an existing comment.
  ```
  renre-kit atlassian-mcp:jira_edit_comment --issueKey "PROJ-123" --commentId "10001" --body "Updated comment text"
  ```

### Transitions — Move issues through workflow states

- **`atlassian-mcp:jira_get_transitions`** — Get available transitions for an issue.

  ```
  renre-kit atlassian-mcp:jira_get_transitions --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_transition_issue`** — Transition an issue (e.g., To Do → In Progress → Done).
  ```
  renre-kit atlassian-mcp:jira_transition_issue --issueKey "PROJ-123" --transitionId "31"
  ```

### Projects — Project metadata, versions, and components

- **`atlassian-mcp:jira_get_all_projects`** — List all accessible projects. No args.

  ```
  renre-kit atlassian-mcp:jira_get_all_projects
  ```

- **`atlassian-mcp:jira_get_project_versions`** — Get project release versions.

  ```
  renre-kit atlassian-mcp:jira_get_project_versions --projectKey "PROJ"
  ```

- **`atlassian-mcp:jira_get_project_components`** — Get project components.

  ```
  renre-kit atlassian-mcp:jira_get_project_components --projectKey "PROJ"
  ```

- **`atlassian-mcp:jira_create_version`** — Create a release version.

  ```
  renre-kit atlassian-mcp:jira_create_version --projectKey "PROJ" --name "v2.1.0" --releaseDate "2026-04-01"
  ```

- **`atlassian-mcp:jira_batch_create_versions`** — Create multiple versions.
  ```
  renre-kit atlassian-mcp:jira_batch_create_versions --projectKey "PROJ" --versions '[{"name": "v2.1.0"}, {"name": "v2.2.0"}]'
  ```

### Agile — Boards, sprints, and sprint management

- **`atlassian-mcp:jira_get_agile_boards`** — List all agile boards (Scrum/Kanban).

  ```
  renre-kit atlassian-mcp:jira_get_agile_boards
  ```

- **`atlassian-mcp:jira_get_board_issues`** — Get issues on a board.

  ```
  renre-kit atlassian-mcp:jira_get_board_issues --boardId 42
  ```

- **`atlassian-mcp:jira_get_sprints_from_board`** — List sprints for a board.

  ```
  renre-kit atlassian-mcp:jira_get_sprints_from_board --boardId 42
  ```

- **`atlassian-mcp:jira_get_sprint_issues`** — Get issues in a specific sprint.

  ```
  renre-kit atlassian-mcp:jira_get_sprint_issues --sprintId 15
  ```

- **`atlassian-mcp:jira_create_sprint`** — Create a new sprint.

  ```
  renre-kit atlassian-mcp:jira_create_sprint --boardId 42 --name "Sprint 10" --startDate "2026-03-24T00:00:00.000Z" --endDate "2026-04-07T00:00:00.000Z" --goal "Complete auth module"
  ```

- **`atlassian-mcp:jira_update_sprint`** — Update sprint details or state.

  ```
  renre-kit atlassian-mcp:jira_update_sprint --sprintId 15 --state "active"
  ```

- **`atlassian-mcp:jira_add_issues_to_sprint`** — Move issues into a sprint.
  ```
  renre-kit atlassian-mcp:jira_add_issues_to_sprint --sprintId 15 --issueKeys '["PROJ-101", "PROJ-102", "PROJ-103"]'
  ```

### Links — Issue relationships and remote links

- **`atlassian-mcp:jira_get_link_types`** — Get available link types (Blocks, Relates, etc.). No args.

  ```
  renre-kit atlassian-mcp:jira_get_link_types
  ```

- **`atlassian-mcp:jira_link_to_epic`** — Link issues to an epic.

  ```
  renre-kit atlassian-mcp:jira_link_to_epic --epicKey "PROJ-50" --issueKeys '["PROJ-101", "PROJ-102"]'
  ```

- **`atlassian-mcp:jira_create_issue_link`** — Create a link between two issues.

  ```
  renre-kit atlassian-mcp:jira_create_issue_link --typeName "Blocks" --inwardIssueKey "PROJ-101" --outwardIssueKey "PROJ-102"
  ```

- **`atlassian-mcp:jira_create_remote_issue_link`** — Link an issue to an external URL.

  ```
  renre-kit atlassian-mcp:jira_create_remote_issue_link --issueKey "PROJ-123" --url "https://github.com/org/repo/pull/42" --title "PR #42: Fix auth bug"
  ```

- **`atlassian-mcp:jira_remove_issue_link`** — Remove a link.
  ```
  renre-kit atlassian-mcp:jira_remove_issue_link --linkId "10001"
  ```

### Worklog — Time tracking

- **`atlassian-mcp:jira_get_worklog`** — Get work log entries.

  ```
  renre-kit atlassian-mcp:jira_get_worklog --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_add_worklog`** — Log time spent.
  ```
  renre-kit atlassian-mcp:jira_add_worklog --issueKey "PROJ-123" --timeSpent "2h 30m" --comment "Implemented the login form"
  ```

### Attachments — Download and inspect attachments

- **`atlassian-mcp:jira_download_attachments`** — Download an attachment by ID.

  ```
  renre-kit atlassian-mcp:jira_download_attachments --attachmentId "10001"
  ```

- **`atlassian-mcp:jira_get_issue_images`** — Get all image attachments for an issue.
  ```
  renre-kit atlassian-mcp:jira_get_issue_images --issueKey "PROJ-123"
  ```

### Users — User profile lookup

- **`atlassian-mcp:jira_get_user_profile`** — Get current user or another user's profile.
  ```
  renre-kit atlassian-mcp:jira_get_user_profile
  renre-kit atlassian-mcp:jira_get_user_profile --accountId "5b10a2844c20165700ede21g"
  ```

### Watchers — Issue watchers management

- **`atlassian-mcp:jira_get_issue_watchers`** — List watchers on an issue.

  ```
  renre-kit atlassian-mcp:jira_get_issue_watchers --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_add_watcher`** — Add a watcher.

  ```
  renre-kit atlassian-mcp:jira_add_watcher --issueKey "PROJ-123" --accountId "5b10a2844c20165700ede21g"
  ```

- **`atlassian-mcp:jira_remove_watcher`** — Remove a watcher.
  ```
  renre-kit atlassian-mcp:jira_remove_watcher --issueKey "PROJ-123" --accountId "5b10a2844c20165700ede21g"
  ```

### Service Desk — JSM queues and requests

- **`atlassian-mcp:jira_get_service_desk_for_project`** — List all service desks. No args.

  ```
  renre-kit atlassian-mcp:jira_get_service_desk_for_project
  ```

- **`atlassian-mcp:jira_get_service_desk_queues`** — Get queues for a service desk.

  ```
  renre-kit atlassian-mcp:jira_get_service_desk_queues --serviceDeskId 1
  ```

- **`atlassian-mcp:jira_get_queue_issues`** — Get issues in a queue.
  ```
  renre-kit atlassian-mcp:jira_get_queue_issues --serviceDeskId 1 --queueId 10
  ```

### Forms — Proforma form data

- **`atlassian-mcp:jira_get_issue_proforma_forms`** — Get forms on an issue.

  ```
  renre-kit atlassian-mcp:jira_get_issue_proforma_forms --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_get_proforma_form_details`** — Get form details.

  ```
  renre-kit atlassian-mcp:jira_get_proforma_form_details --issueKey "PROJ-123" --formId "form-1"
  ```

- **`atlassian-mcp:jira_update_proforma_form_answers`** — Update form answers.
  ```
  renre-kit atlassian-mcp:jira_update_proforma_form_answers --issueKey "PROJ-123" --formId "form-1" --answers '{"field1": "value1"}'
  ```

### Metrics — Dates and SLA tracking

- **`atlassian-mcp:jira_get_issue_dates`** — Get date fields (created, updated, resolved, due).

  ```
  renre-kit atlassian-mcp:jira_get_issue_dates --issueKey "PROJ-123"
  ```

- **`atlassian-mcp:jira_get_issue_sla`** — Get SLA information for a service request.
  ```
  renre-kit atlassian-mcp:jira_get_issue_sla --issueKey "PROJ-123"
  ```

### Development — Linked commits, branches, and PRs

- **`atlassian-mcp:jira_get_issue_development_info`** — Get dev info for one issue.

  ```
  renre-kit atlassian-mcp:jira_get_issue_development_info --issueId "10001"
  ```

- **`atlassian-mcp:jira_get_issues_development_info`** — Get dev info for multiple issues.
  ```
  renre-kit atlassian-mcp:jira_get_issues_development_info --issueIds '["10001", "10002"]'
  ```

## Required Workflow

**Follow these steps when working with Jira issues.**

### Step 1: Verify Connection

Check that the Atlassian MCP server is available. If not, guide the user through setup (see Prerequisites).

### Step 2: Gather Context

Before making changes, always fetch the current state first:

1. To find issues: use `atlassian-mcp:jira_search` with an appropriate JQL query
2. To understand a specific issue: use `atlassian-mcp:jira_get_issue`
3. Before transitioning: use `atlassian-mcp:jira_get_transitions` to discover valid transitions

### Step 3: Make Changes

Apply the requested changes (create, update, transition, comment, etc.).

### Step 4: Confirm Result

After making changes, fetch the updated issue with `atlassian-mcp:jira_get_issue` to confirm the changes were applied successfully. Report the result to the user.

## Examples

### Example 1: Find and update a bug

User says: "Mark PROJ-456 as In Progress and add a comment that I'm starting work"

**Actions:**

1. Get available transitions: `renre-kit atlassian-mcp:jira_get_transitions --issueKey "PROJ-456"`
2. Find the "In Progress" transition ID from the response (e.g., `21`)
3. Transition the issue: `renre-kit atlassian-mcp:jira_transition_issue --issueKey "PROJ-456" --transitionId "21"`
4. Add the comment: `renre-kit atlassian-mcp:jira_add_comment --issueKey "PROJ-456" --body "Starting work on this issue."`
5. Verify: `renre-kit atlassian-mcp:jira_get_issue --issueKey "PROJ-456"`

### Example 2: Create tasks for a feature

User says: "Create 3 subtasks under PROJ-100 for login, signup, and password reset"

**Actions:**

1. Get the parent issue to confirm it exists: `renre-kit atlassian-mcp:jira_get_issue --issueKey "PROJ-100"`
2. Get the project key from the issue
3. Create tasks: `renre-kit atlassian-mcp:jira_batch_create_issues --issues '[{"fields": {"project": {"key": "PROJ"}, "issuetype": {"name": "Sub-task"}, "parent": {"key": "PROJ-100"}, "summary": "Implement login page"}}, {"fields": {"project": {"key": "PROJ"}, "issuetype": {"name": "Sub-task"}, "parent": {"key": "PROJ-100"}, "summary": "Implement signup page"}}, {"fields": {"project": {"key": "PROJ"}, "issuetype": {"name": "Sub-task"}, "parent": {"key": "PROJ-100"}, "summary": "Implement password reset"}}]'`
4. Report the created issue keys to the user

### Example 3: Sprint planning

User says: "What's in the current sprint for board 42?"

**Actions:**

1. Get sprints: `renre-kit atlassian-mcp:jira_get_sprints_from_board --boardId 42`
2. Find the active sprint from the response
3. Get sprint issues: `renre-kit atlassian-mcp:jira_get_sprint_issues --sprintId 15`
4. Summarize the issues for the user (count by status, highlight blockers)

### Example 4: Link a PR to an issue

User says: "Link PR #42 from our GitHub repo to PROJ-123"

**Actions:**

1. Create the remote link: `renre-kit atlassian-mcp:jira_create_remote_issue_link --issueKey "PROJ-123" --url "https://github.com/org/repo/pull/42" --title "PR #42: Feature implementation"`
2. Confirm the link was created

## Best Practices

### Always Fetch Before Mutating

Never assume the current state of an issue. Always use `jira_get_issue` or `jira_search` before updating, transitioning, or commenting.

### Use JQL Effectively

JQL is powerful for filtering. Common patterns:

- `project = PROJ AND status = "In Progress"` — active work
- `assignee = currentUser() AND sprint in openSprints()` — my sprint work
- `priority = Highest AND status != Done` — critical open issues
- `updated >= -7d ORDER BY updated DESC` — recently changed

### Respect Workflows

Before transitioning an issue, always call `jira_get_transitions` to discover valid next states. Don't assume transition IDs — they vary by project workflow.

### Confirm Destructive Actions

Before deleting issues or removing links, confirm with the user. These actions may not be reversible.

## Common Issues and Solutions

### Issue: "Missing Atlassian configuration" error

**Cause:** The extension's domain, email, or API token is not configured.
**Solution:** Guide the user to configure the extension:

```
renre-kit ext config atlassian-mcp --set domain=company.atlassian.net
renre-kit ext config atlassian-mcp --set email=user@company.com
renre-kit vault set atlassian-mcp.apiToken
```

### Issue: 401 Unauthorized

**Cause:** Invalid API token or email.
**Solution:** Verify the API token is valid and matches the configured email. Tokens can be generated at https://id.atlassian.com/manage-profile/security/api-tokens.

### Issue: 403 Forbidden on a specific operation

**Cause:** The user's Atlassian account lacks the required permissions for that operation.
**Solution:** Inform the user they need appropriate Jira permissions (e.g., project admin for creating versions, issue edit for transitions).

### Issue: JQL query returns no results

**Cause:** Incorrect project key, field name, or JQL syntax.
**Solution:** Use `atlassian-mcp:jira_get_all_projects` to verify project keys, and `atlassian-mcp:jira_search_fields` to discover correct field names.
