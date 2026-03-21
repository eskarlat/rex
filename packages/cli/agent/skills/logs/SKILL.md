---
name: logs
description: Write log entries to the RenreKit log system — use to record diagnostic info, warnings, or errors visible in the dashboard logs page
---

# renre-kit/logs

Write log entries to the RenreKit logging system. Entries appear in the dashboard Logs page.

## Commands

### logs:write

Write a log entry. Requires the dashboard server to be running.

**Arguments:**
- `<level>` — Log level: debug, info, warn, or error
- `<source>` — Source identifier (must start with `ext:`)
- `<message>` — Log message
- `--data <json>` — Optional JSON metadata (default: `{}`)

**Example:**

```
renre-kit logs:write info ext:my-ext "Processing started" --data '{"items":42}'
```

## Log Levels

| Level   | Use for                                         |
| ------- | ----------------------------------------------- |
| `debug` | Detailed diagnostic info, variable dumps        |
| `info`  | Normal operational messages, progress updates   |
| `warn`  | Potential issues, unexpected but handled states |
| `error` | Failures, exceptions, unrecoverable errors      |

## When to Use

- To record progress during long-running operations
- To log errors or warnings for later diagnosis
- To provide audit trails for automated actions
- To record diagnostic information visible in the dashboard

## Notes

- The `source` must start with `ext:` (e.g., `ext:my-ext`, `ext:atlassian`)
- Log entries appear on the dashboard Logs page when the server is running
- This is write-only — you cannot read or query logs via CLI
- Reuses the existing `POST /api/logs/write` endpoint
