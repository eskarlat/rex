---
name: notify
description: Send a persistent notification to the user dashboard — use to inform about completed tasks, errors, or actions that need attention
---

# renre-kit/notify

Send a persistent notification visible in the dashboard notification center.

## Commands

### notify

Create a notification. Stored in the database until the user dismisses it.

**Arguments:**
- `<title>` — Notification title
- `<message>` — Notification message body
- `--variant <type>` — info, success, warning, or error (default: info)
- `--source <name>` — Extension name that sent the notification
- `--action-url <path>` — Dashboard path to navigate to when clicked (e.g., `/extensions/my-ext/panel`)

**Example:**

```
renre-kit notify "Sync Complete" "3 issues updated from Jira" --variant success --source atlassian --action-url /extensions/atlassian/panel
```

## When to Use

- After completing a task the user should know about
- When an error occurs that requires user attention
- To alert about available updates or required actions
- To report results of background operations

## Variants

| Variant   | Use for                                    |
| --------- | ------------------------------------------ |
| `info`    | General status updates (default)           |
| `success` | Completed operations, successful syncs     |
| `warning` | Non-critical issues, deprecation notices   |
| `error`   | Failed operations, errors needing attention|

## Notes

- Notifications persist in the database until the user dismisses them
- The `--action-url` should be a relative dashboard path (e.g., `/extensions/my-ext/panel`)
- This is write-only — you cannot read or query notifications via CLI
