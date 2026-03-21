---
name: events
description: Publish inter-extension events to notify other extensions or trigger workflows — use when a task completes, state changes, or cross-extension coordination is needed
---

# renre-kit/events

Publish events to the inter-extension event bus. Requires the dashboard server to be running (`renre-kit ui`).

## Commands

### events:publish

Publish an event to the event bus. All subscribed extensions receive it.

**Arguments:**
- `<type>` — Event type string (convention: `ext:{extension-name}:{event-name}`)
- `--data <json>` — JSON payload (default: `{}`)
- `--source <name>` — Source identifier (default: `system`)

**Example:**

```
renre-kit events:publish ext:my-ext:task-complete --data '{"taskId":"123","status":"done"}' --source my-ext
```

## When to Use

- After completing a task that other extensions might react to
- When state changes that dependent extensions should know about
- To coordinate multi-extension workflows (e.g., Jira ticket created → GitHub branch linked)

## Notes

- Events are fire-and-forget — no delivery guarantee if no subscribers are listening
- The dashboard server must be running (`renre-kit ui`) for events to be delivered
- Event types should follow the `ext:{extension-name}:{event-name}` convention
- This is write-only — you cannot subscribe to or read events via CLI
