# ADR-002: Persist Scheduled Tasks in SQLite with Rolling Execution History

## Status

Accepted

## Context

Scheduled tasks must survive dashboard restarts. Users need visibility into task execution history for debugging (e.g., "Did the sync task run last night?"). Without persistence, all task registrations are lost on restart. Without history, debugging missed executions is difficult.

## Decision

Persist scheduled tasks in SQLite with execution history:

1. **scheduled_tasks table**: Stores task definitions
   - Columns: id, extensionName, taskName, cronExpression, command, enabled, createdAt, updatedAt
   - Primary key: (extensionName, taskName) - extensions cannot have duplicate task names
2. **task_history table**: Stores execution logs
   - Columns: id, taskId, executedAt, completedAt, exitCode, output, errorMessage
   - Bounded by 50-row rolling limit per task (oldest rows auto-deleted)
3. **Relationships**: task_history.taskId references scheduled_tasks.id with CASCADE DELETE
4. Database: Shared core SQLite database (same DB as extensions, projects, etc.)

## Consequences

### Positive

- **Persistence across restarts**: Tasks survive dashboard restart
- **Execution history**: Users can debug missed or failed tasks
- **Bounded storage**: 50-row limit per task prevents database bloat
- **Automatic cleanup**: CASCADE DELETE ensures orphaned history is removed when task is deleted
- **Single database**: Simpler than managing separate scheduler database
- **Transaction support**: Can ensure task + history written atomically

### Negative

- **Database dependency**: Scheduler is tightly coupled to core database
- **Migration complexity**: Schema changes require database migration tooling
- **Limited history**: 50 rows may not be enough for long-running systems
- **No external visibility**: Execution history not accessible outside the system
- **Time-based cleanup**: No time-based retention policy (only count-based)
- **Clock-dependent**: Task execution times depend on system clock accuracy
