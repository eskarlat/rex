# ADR-001: Dynamic Task Registration via SDK Instead of Static Manifest Declarations

## Status

Accepted

## Context

Scheduled task intervals should be user-configurable, not hardcoded by extension authors. Some extensions might offer sensible defaults (e.g., "check for updates hourly"), but users should be able to adjust these without modifying extension code. A static manifest approach locks schedules in; a dynamic approach allows extensions to expose scheduling controls in the dashboard UI.

## Decision

Extensions register scheduled tasks dynamically via SDK at runtime:

1. Extensions initialize and call `sdk.scheduler.register(name, cronExpression, command)` to create tasks
2. Tasks are stored in the scheduler's SQLite database with their cron expressions
3. Extension UIs can expose controls to modify cron expressions
4. Extensions unregister tasks via `sdk.scheduler.unregister(name)` when configuration changes
5. Tasks are namespaced by extension name to prevent collisions

This approach gives users control over schedules while keeping extension manifests simple.

## Consequences

### Positive

- **User control**: Schedules are configurable, not hardcoded
- **Dynamic adjustment**: Tasks can be registered/unregistered at any time
- **Dashboard integration**: Settings UI can display and modify task schedules
- **Flexible defaults**: Extensions can suggest defaults but let users override

### Negative

- **Tasks require dashboard**: Scheduler runs in the dashboard, not as system daemon; stops when dashboard stops
- **SDK complexity**: Adds scheduler API to SDK
- **Error handling**: Must handle cases where registration fails (database issues, invalid cron)
- **Cleanup**: Extensions must handle unregistration on removal (requires lifecycle hooks)
- **No system-level scheduling**: Cannot integrate with cron/Task Scheduler for persistent execution
