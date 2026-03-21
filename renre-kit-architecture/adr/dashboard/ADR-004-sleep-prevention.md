# ADR-004: Prevent System Sleep While Dashboard is Running

## Status

Accepted

## Context

The system supports MCP (Model Context Protocol) server connections and scheduled task execution. Both require the machine to remain awake and responsive. If the system enters sleep mode while:

- A scheduled task is due to run, it will miss the execution window
- An MCP server is connected, the connection will drop
- A background process is active, it may be suspended

Users expect scheduled tasks and MCP connections to work reliably, which requires the machine to stay awake.

## Decision

Prevent system sleep while the dashboard (and core scheduler) is running:

1. **macOS**: Use `caffeinate -i` to prevent idle sleep
2. **Linux**: Use `systemd-inhibit` to inhibit sleep via D-Bus
3. **Windows**: Use `SetThreadExecutionState` Win32 API with `ES_CONTINUOUS | ES_SYSTEM_REQUIRED`
4. Activation: Inhibitor started when dashboard starts
5. Deactivation: Inhibitor released when dashboard shuts down
6. Configuration: Controllable via `server.preventSleep` config flag (default: true)

## Consequences

### Positive

- **Reliable execution**: Scheduled tasks run on time
- **MCP connection stability**: Server connections remain active
- **Cross-platform**: Handles macOS, Linux, Windows uniformly
- **Transparent to user**: No user action required
- **Reversible**: Config flag allows opting out

### Negative

- **Battery impact**: Significant power drain on laptops
- **User expectations**: Users may be surprised that their machine doesn't sleep
- **Platform-specific code**: Each OS has different inhibitor mechanism
- **Dependency on OS support**: Some platforms may not support sleep inhibition
- **Not foolproof**: Some sleep triggers (user-initiated shutdown, power loss) cannot be prevented
- **Cleanup issues**: If process crashes, inhibitor may persist (requires system intervention)
