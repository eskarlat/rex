# Context7

Library documentation lookup via Context7 MCP server.

## Features

- **Documentation Lookup**: Query up-to-date documentation for libraries and frameworks directly from your development environment.
- **Dashboard Widget**: Status widget showing Context7 server connection state.
- **Agent Skills**: LLM-ready skill for `context7` documentation queries.

## Configuration

No configuration required. The extension uses the public `@upstash/context7-mcp` package via npx.

## Usage

```bash
# Check server status
renre-kit context7-mcp:status
```

## Transport

MCP stdio — runs `npx -y @upstash/context7-mcp` as a child process communicating via JSON-RPC over stdin/stdout.
