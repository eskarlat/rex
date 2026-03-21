# Figma

Figma design file tools via MCP server with SSE transport.

## Features

- **Design File Access**: Read and interact with Figma design files programmatically.
- **Dashboard Widget**: Status widget showing Figma server connection state.
- **Agent Skills**: LLM-ready skills for `figma` design operations and `code-connect` integration.

## Configuration

| Field       | Type   | Secret | Description                            |
| ----------- | ------ | ------ | -------------------------------------- |
| `serverUrl` | string | No     | Figma MCP server SSE endpoint URL      |

Default server URL: `http://localhost:3845/sse`

## Usage

```bash
# Check server status
renre-kit figma-mcp:status
```

## Transport

MCP SSE — connects to a running Figma MCP server via Server-Sent Events over HTTP.
