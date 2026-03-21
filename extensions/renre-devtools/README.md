# Browser Devtools

Browser automation and debugging via Puppeteer MCP server.

## Features

- **Browser Automation**: Launch a headed browser, navigate to URLs, click elements, fill forms, and interact with web pages.
- **Debugging**: Inspect open tabs, execute JavaScript in page context, and capture console output.
- **Screenshots**: Take full-page or element-specific screenshots for visual debugging.
- **Dashboard Widget**: Browser status widget showing active sessions.
- **Agent Skills**: LLM-ready skills for `browser-navigate`, `browser-inspect`, and `browser-screenshot`.

## Configuration

No configuration required. The extension uses the `@modelcontextprotocol/server-puppeteer` package via npx.

## Usage

```bash
# Check server status
renre-kit renre-devtools:status
```

## Transport

MCP stdio — runs `npx -y @modelcontextprotocol/server-puppeteer` as a child process communicating via JSON-RPC over stdin/stdout.
