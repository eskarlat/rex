# GitHub

GitHub integration via official MCP server.

## Features

- **Repository Management**: Interact with repositories, issues, pull requests, and more through the official GitHub MCP server.
- **Dashboard Widget**: Status widget showing GitHub server connection state.
- **Agent Skills**: LLM-ready skill for `github` operations.

## Configuration

| Field         | Type   | Secret | Description                                                         |
| ------------- | ------ | ------ | ------------------------------------------------------------------- |
| `githubToken` | string | Yes    | GitHub personal access token for API authentication                 |
| `githubHost`  | string | No     | GitHub Enterprise host (e.g., github.mycompany.com). Empty for github.com |

## Usage

```bash
# Check server status
renre-kit github-mcp:status
```

## Transport

MCP stdio — runs `npx -y @modelcontextprotocol/server-github` as a child process communicating via JSON-RPC over stdin/stdout.
