---
name: echo
description: This tool need to be used when the user wants to test MCP connectivity, echo a message back, or debug the MCP transport — e.g. "echo this", "ping the MCP server", "test MCP connection"
---

# echo-mcp

An MCP (Model Context Protocol) extension that echoes back messages via JSON-RPC over stdio.

## Commands

### echo-mcp:echo
Echoes back the provided parameters.

**Example:**
```
renre-kit echo-mcp:echo "hello"
```

### echo-mcp:ping
Returns "pong" to verify the connection is alive.

**Example:**
```
renre-kit echo-mcp:ping
```
