# Miro MCP

Miro integration via MCP — 98 tools for boards, items, collaboration, and more.

## Features

- **Board Management**: Create and manage boards, frames, shapes, sticky notes, text, images, cards, app cards, connectors, and mind maps.
- **Collaboration**: Tags, groups, members, projects, bulk operations, exports, and compliance tools.
- **Dashboard Widget**: Status widget showing Miro server connection state.
- **Agent Skills**: LLM-ready skill for `miro` board operations.

## Configuration

| Field         | Type   | Secret | Description                      |
| ------------- | ------ | ------ | -------------------------------- |
| `accessToken` | string | Yes    | Miro access token                |

Generate an access token at https://miro.com/app/settings/user-profile/apps

## Usage

```bash
# Check connection status
renre-kit miro-mcp:status
```

## Transport

MCP stdio — runs as a child process communicating via JSON-RPC over stdin/stdout.
