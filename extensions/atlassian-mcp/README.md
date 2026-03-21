# Atlassian MCP

Jira and Confluence integration via MCP — 72 tools for issues, pages, sprints, and more.

## Features

- **Jira**: Create, update, search, and transition issues. Manage sprints, boards, comments, worklogs, attachments, fields, links, and service desk requests.
- **Confluence**: Create, read, update pages. Manage comments, labels, attachments, analytics, and user lookups.
- **Dashboard Widgets**: My Jira Tasks, Recent Comments, and Confluence Updates widgets for at-a-glance project status.
- **Agent Skills**: LLM-ready skills for `jira` and `confluence` operations.

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
renre-kit atlassian-mcp:status
```

## Transport

MCP stdio — runs as a child process communicating via JSON-RPC over stdin/stdout.
