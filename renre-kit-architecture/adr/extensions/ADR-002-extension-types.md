# ADR-002: Three Extension Types (Standard JS, MCP Stdio, MCP SSE)

## Status

Accepted

## Context

Extensions have different runtime requirements:

- **Simple tools**: Written in JS/TS, loaded directly in CLI process (e.g., CLI command generators)
- **Server tools**: Need a separate process (e.g., Claude MCP via stdio)
- **Remote tools**: Access external services via HTTP/SSE (e.g., Claude MCP over SSE, Figma webhooks)

Building three separate extension systems would create fragmentation and cognitive load for users. A unified interface is preferable.

## Decision

Support all three types behind a unified extension interface:

1. **Standard JS extensions**: Load directly in the CLI process via dynamic import
2. **MCP Stdio extensions**: Spawn a server subprocess, communicate via JSON-RPC over stdin/stdout
3. **MCP SSE extensions**: Connect to a remote server via HTTP Server-Sent Events

All three expose commands and tools through the same registry. Users select extensions without knowing the underlying type.

## Consequences

### Positive

- Unified experience: Users don't care whether an extension is JS, a subprocess, or remote
- Flexibility: Tool authors choose the best deployment model for their use case
- Backward compatibility: Adding new types doesn't break existing extensions
- Seamless integration: All commands appear first-class in the CLI

### Negative

- Added complexity: `ConnectionManager` must handle three different connection types
- Type safety challenges: Dynamic typing for command schemas across different extension types
- Testing burden: Each extension type needs separate test harness
- Debugging difficulty: Stdio extension errors require log inspection; not visible in main process
- Remote failure modes: SSE extensions can timeout or disconnect unpredictably

## Implementation Details

- **ConnectionManager**: Central registry that abstraction over three transport types
- **Command registry**: Extensions register commands with identical schema, regardless of type
- **Error handling**: Stdio and SSE errors are caught and displayed as command failures
- **Lifecycle**: Stdio processes managed by lifecycle hooks (spawn on demand, kill on CLI exit)

## Alternatives Considered

- **Single type only** (e.g., JS only): Limits integration capabilities; no offline support for remote tools
- **Three separate CLI tools**: Confusion for users; multiple entry points to maintain

## Related Decisions

- ADR-005: Bundled MCP Servers (how MCP extensions are distributed)
- ADR-001: Microkernel Architecture (extensions plugged into core)
