# ADR-002: Dynamic Scheduler Task Registration via SDK

## Status
Accepted

## Context
Scheduled tasks should not be hardcoded by extension authors. Users need to configure how often tasks run (e.g., "sync every 30 minutes" vs "sync every hour"). If schedules are static in manifests, users cannot customize them without modifying the extension itself.

## Decision
Extensions register scheduled tasks dynamically at runtime via SDK methods:
1. Extensions call `sdk.scheduler.register(name, cronExpression, command)` to create or update tasks
2. Extensions call `sdk.scheduler.unregister(name)` to remove tasks
3. Extensions call `sdk.scheduler.list()` to query registered tasks
4. Tasks are persisted in SQLite (scheduled_tasks table)
5. Extension UIs can expose scheduling controls to users (cron expression picker, human-readable interval selector)
6. Tasks survive dashboard restarts and extension reloads

## Consequences

### Positive
- **User-configurable schedules**: Intervals not hardcoded by extension authors
- **Dashboard management**: Users can view, edit, or delete schedules from Settings
- **Runtime flexibility**: Extensions can dynamically register/unregister tasks based on configuration
- **Persistence**: Tasks survive restarts
- **SDK-driven**: Extensions use standard SDK, not custom scripting languages

### Negative
- **SDK complexity**: Scheduler API adds complexity to SDK surface
- **Dashboard-dependent**: Tasks only execute when dashboard is running (not a system daemon)
- **Cron knowledge required**: Users need to understand cron syntax (or UI must abstract it)
- **State management**: Extensions must handle task lifecycle (cleanup on uninstall)
- **Execution guarantees**: No guaranteed execution times; depends on dashboard uptime
- **Clock skew issues**: Cron-based scheduling can drift if system clock changes
