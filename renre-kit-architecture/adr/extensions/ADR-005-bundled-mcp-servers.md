# ADR-005: Bundled MCP Servers Inside Extension Packages

## Status
Accepted

## Context
MCP extensions need a server process. The server binary/script must be available when the extension is activated. Options:
1. **Bundled**: Server code lives in the extension package; downloaded together
2. **External**: Server installed separately (via npm, apt, brew, etc.)
3. **System-wide**: MCP servers installed once globally for all extensions
4. **Remote**: Server runs in the cloud; CLI connects via HTTP/SSE

Each option has tradeoffs around versioning, offline support, and packaging.

## Decision
Bundle MCP servers inside extension packages:
- Extension directory structure:
  ```
  ~/.renre-kit/extensions/claude/2.1.0/
  ├── package.json
  ├── manifest.json
  ├── index.js           # CLI commands
  ├── server/
  │   ├── package.json   # Server dependencies
  │   ├── index.js       # MCP server entry point
  │   └── node_modules/
  └── ui.js              # Optional dashboard UI
  ```
- Server installed alongside extension
- CLI spawns server from extension package location
- Server lifetime managed by CLI (spawn on first use, kill on CLI exit)

## Consequences

### Positive
- Offline support: Server available immediately after extension download
- Version consistency: Server version always matches extension version; no compatibility matrix
- Self-contained: No external dependencies or package managers needed
- Isolation: Each extension's server runs independently; no shared state issues
- Portability: Move extension folder to new machine; server comes with it

### Negative
- Larger download: Server dependencies increase extension package size (50 MB → 80 MB)
- Storage duplication: Multiple extensions with similar servers waste disk space
- Build complexity: Extensions must include build step for server
- Startup overhead: Spawning server subprocess adds latency to first use
- Platform-specific binaries: Native dependencies in servers require platform-specific packages

## Alternatives Considered
- **External install** (e.g., `npm install -g @anthropic/mcp-claude`): Requires separate package management; version mismatches between extension and server; not offline-friendly
- **System-wide MCP servers** (e.g., `/opt/renre-kit/mcp/`): Shared state and versioning issues; complex lifecycle management
- **Cloud-based servers** (e.g., remote HTTPS endpoint): Reduces offline capability; adds latency; requires authentication
- **Container-based** (e.g., Docker): Overkill for CLI; adds runtime dependency

## Implementation Details
- **Server manifest**: Extension's `manifest.json` specifies server entry point:
  ```json
  {
    "name": "claude",
    "version": "2.1.0",
    "server": {
      "type": "mcp-stdio",
      "command": "node",
      "args": ["server/index.js"]
    }
  }
  ```
- **Lifecycle management**: CLI maintains list of active server processes; kills on exit
- **Logging**: Server stdout/stderr logged to `~/.renre-kit/logs/extension-{name}-{version}.log`

## Related Decisions
- ADR-002: Extension Types (MCP Stdio extensions use bundled servers)
- ADR-001: Global Install, Local Activation (extensions stored in ~/.renre-kit/extensions/)
