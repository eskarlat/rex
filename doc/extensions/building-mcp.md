# Building an MCP Extension

MCP (Model Context Protocol) extensions wrap an MCP server as a child process or connect to a remote server. They're perfect for wrapping existing MCP servers, building language-agnostic tools, or when you need full process isolation.

## Scaffold It

```bash
npx create-renre-extension my-mcp-tool --type mcp
```

This generates:

```
my-mcp-tool/
├── package.json
├── manifest.json
├── tsconfig.json
├── src/
│   └── server.ts         # MCP JSON-RPC server
└── agent/
    └── skills/
        └── my-skill/
            └── SKILL.md
```

## The Manifest

An MCP extension's manifest has a special `mcp` section:

```json
{
  "name": "my-mcp-tool",
  "version": "1.0.0",
  "description": "An MCP-based extension",
  "type": "mcp",
  "engines": {
    "renre-kit": ">= 0.0.1",
    "extension-sdk": ">= 0.0.1"
  },
  "mcp": {
    "transport": "stdio",
    "command": "node",
    "args": ["dist/server.js"],
    "env": {
      "API_TOKEN": "${config.apiToken}"
    }
  },
  "commands": {
    "status": {
      "handler": "dist/commands/status.js",
      "description": "Check MCP server health"
    }
  },
  "config": {
    "schema": {
      "apiToken": {
        "type": "string",
        "description": "API token for authentication",
        "secret": true,
        "vaultHint": "MY_MCP_TOKEN"
      }
    }
  },
  "ui": {
    "panels": [
      {
        "id": "main-panel",
        "title": "My MCP Tool",
        "entry": "dist/panel.js"
      }
    ],
    "widgets": [
      {
        "id": "status-widget",
        "title": "Status",
        "entry": "dist/status-widget.js",
        "defaultSize": { "w": 3, "h": 2 },
        "minSize": { "w": 2, "h": 1 },
        "maxSize": { "w": 6, "h": 3 }
      }
    ]
  }
}
```

### MCP Transport Options

#### stdio (recommended)

The server runs as a child process. Communication happens over stdin/stdout using JSON-RPC:

```json
{
  "mcp": {
    "transport": "stdio",
    "command": "node",
    "args": ["dist/server.js"]
  }
}
```

You can also wrap third-party MCP servers that are installed via npx:

```json
{
  "mcp": {
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${config.githubToken}"
    }
  }
}
```

#### SSE (Server-Sent Events)

For remote servers that expose an SSE endpoint:

```json
{
  "mcp": {
    "transport": "sse",
    "url": "https://my-mcp-server.example.com/sse",
    "headers": {
      "Authorization": "Bearer ${config.apiToken}"
    }
  }
}
```

## Writing an MCP Server

If you're building your own MCP server (not wrapping an existing one), here's the basic structure:

```typescript
// src/server.ts
import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

const rl = readline.createInterface({ input: stdin });

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

function handleRequest(request: JsonRpcRequest): JsonRpcResponse {
  switch (request.method) {
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: [
            {
              name: 'do_something',
              description: 'Does something useful',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'The query to process' },
                },
                required: ['query'],
              },
            },
          ],
        },
      };

    case 'tools/call':
      const toolName = request.params?.name as string;
      if (toolName === 'do_something') {
        const query = (request.params?.arguments as Record<string, unknown>)?.query;
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{ type: 'text', text: `Processed: ${query}` }],
          },
        };
      }
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      };

    default:
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Unknown method: ${request.method}` },
      };
  }
}

rl.on('line', (line: string) => {
  try {
    const request = JSON.parse(line) as JsonRpcRequest;
    const response = handleRequest(request);
    stdout.write(JSON.stringify(response) + '\n');
  } catch {
    // Ignore malformed input
  }
});
```

## Wrapping Third-Party MCP Servers

The most common use case for MCP extensions is wrapping existing MCP servers. The RenreKit repo has several examples:

### GitHub MCP

```json
{
  "mcp": {
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${config.githubToken}"
    }
  }
}
```

### Miro MCP (local server)

```json
{
  "mcp": {
    "transport": "stdio",
    "command": "node",
    "args": ["dist/server.js"],
    "env": {
      "MIRO_API_TOKEN": "${config.accessToken}"
    }
  }
}
```

### Atlassian (renre-atlassian)

> **Note:** The Atlassian extension has been converted from an MCP wrapper to a standard in-process extension (`renre-atlassian`) with 75 direct CLI commands and Zod validation. See `extensions/renre-atlassian/` for the current implementation.

## Connection Management

RenreKit handles MCP connections automatically:

| Feature | Behavior |
|---------|----------|
| **Lazy start** | Server only starts when a tool is first called |
| **Idle timeout** | Server stops after 30 seconds of inactivity |
| **Auto-restart** | Exponential backoff restart on failure (max 3 retries) |
| **Health checks** | Connection manager tracks server status |

You don't need to manage any of this yourself — just define the transport in your manifest and RenreKit handles the rest.

## Adding Local Commands

MCP extensions can also have regular local commands (not MCP tools). These run in the RenreKit process, not in the MCP server:

```typescript
// commands/status.ts
export default function status(context: ExecutionContext) {
  return {
    output: 'MCP server is healthy',
    exitCode: 0,
  };
}
```

This is useful for health checks, config display, or other quick commands that don't need the MCP server.

::: tip When to wrap vs. build
If there's already an MCP server for the tool you want (check the [MCP server directory](https://modelcontextprotocol.io/)), just wrap it. Building your own server only makes sense when no existing server fits your needs.
:::
