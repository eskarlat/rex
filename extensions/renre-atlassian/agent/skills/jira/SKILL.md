---
name: jira
description: Manages Jira issues, sprints, boards, projects, worklogs, comments, transitions, links, watchers, service desk queues, forms, metrics, and development info. Use when user mentions Jira issues, sprints, boards, backlogs, JQL queries, issue keys (e.g., PROJ-123), or asks to create/update/search issues.
---

# Jira

## Overview

This skill provides 50 Jira commands via the renre-atlassian CLI extension. All commands are invoked through RenreKit's CLI using the `renre-atlassian:` namespace.

## Quick Start

If you need to discover available commands and their arguments, run:
```
renre-kit renre-atlassian:jira-help
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

Arguments are passed as `--key "value"` flags. Object/array arguments are passed as JSON strings.

## Key Commands

### Issues
- `renre-atlassian:jira-get-issue --issueKey "PROJ-123"`
- `renre-atlassian:jira-search --jql "project = PROJ AND status = 'In Progress'"`
- `renre-atlassian:jira-create-issue --projectKey "PROJ" --issueType "Task" --summary "Title"`
- `renre-atlassian:jira-update-issue --issueKey "PROJ-123" --fields '{"summary": "New title"}'`
- `renre-atlassian:jira-delete-issue --issueKey "PROJ-123"`

### Transitions
- `renre-atlassian:jira-get-transitions --issueKey "PROJ-123"`
- `renre-atlassian:jira-transition-issue --issueKey "PROJ-123" --transitionId "31"`

### Agile
- `renre-atlassian:jira-get-agile-boards`
- `renre-atlassian:jira-get-sprint-issues --sprintId 15`
- `renre-atlassian:jira-add-issues-to-sprint --sprintId 15 --issueKeys '["PROJ-101"]'`

### Comments
- `renre-atlassian:jira-add-comment --issueKey "PROJ-123" --body "Comment text"`

## Required Workflow

1. **Discover commands**: `renre-kit renre-atlassian:jira-help`
2. **Gather context**: Always fetch current state before making changes
3. **Make changes**: Execute the appropriate command
4. **Confirm result**: Fetch the updated resource to verify

## Best Practices

- Always call `jira-get-transitions` before `jira-transition-issue` — transition IDs vary by workflow
- Use JQL effectively: `assignee = currentUser() AND sprint in openSprints()`
- Confirm destructive actions (delete, remove) with the user first
- For the full command reference with all arguments: `renre-kit renre-atlassian:jira-help`
