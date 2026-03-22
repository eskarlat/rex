# Renre Atlassian

Jira and Confluence integration — 75 CLI commands for issues, pages, sprints, and more.

## Features

- **Jira** (50 commands): Create, update, search, and transition issues. Manage sprints, boards, comments, worklogs, attachments, fields, links, watchers, forms, SLA, dev info, and service desk requests.
- **Confluence** (23 commands): Search, create, update, delete, and move pages. Manage comments, labels, attachments, analytics, and user lookups.
- **Help** (2 commands): `jira-help` and `confluence-help` for discovering available commands with usage examples.
- **Dashboard Widgets**: My Jira Tasks, Recent Comments, and Confluence Updates widgets for at-a-glance project status.
- **Agent Skills**: LLM-ready skills for `jira`, `confluence`, and `help` operations with SKILL.md definitions.
- **Zod Validation**: All command arguments validated with Zod schemas for type safety and clear error messages.

## Configuration

| Field      | Type   | Secret | Description                                                      |
| ---------- | ------ | ------ | ---------------------------------------------------------------- |
| `domain`   | string | No     | Atlassian Cloud domain (e.g., mycompany.atlassian.net)           |
| `email`    | string | No     | Atlassian account email address                                  |
| `apiToken` | string | Yes    | Atlassian API token                                              |

Generate an API token at https://id.atlassian.com/manage-profile/security/api-tokens

## Usage

```bash
# Check connection status
renre-kit renre-atlassian:status

# Show available Jira commands
renre-kit renre-atlassian:jira-help

# Show available Confluence commands
renre-kit renre-atlassian:confluence-help

# Get a Jira issue
renre-kit renre-atlassian:jira-get-issue --issueKey PROJ-123

# Search issues with JQL
renre-kit renre-atlassian:jira-search --jql "project = PROJ AND status = Open"

# Search Confluence pages
renre-kit renre-atlassian:confluence-search --query "meeting notes"
```

## Development

This is a **standard** (in-process) extension with Zod schema validation on all commands.

```bash
cd extensions/renre-atlassian
pnpm build    # node build.js
pnpm test     # vitest
```
