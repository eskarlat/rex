# ADR-007: Notification Center

## Status

Proposed

## Context

Users have no unified feed for extension activity. Toasts are ephemeral and easy to miss — once dismissed or timed out, the information is gone. Extensions need a way to send persistent, actionable notifications to the user:

- "Jira sync completed — 3 issues updated"
- "Extension update available: hello-world v1.1.0"
- "Scheduled task failed: backup-db (exit code 1)"
- "GitHub PR #42 merged — branch cleanup available"

These messages need to persist until the user acknowledges them, support different severity levels, and optionally link back to the source extension's panel for follow-up action.

## Decision

### 1. New `notifications` table in SQLite

```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    extension_name TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    variant TEXT NOT NULL DEFAULT 'info' CHECK(variant IN ('info', 'success', 'warning', 'error')),
    action_url TEXT,
    read INTEGER NOT NULL DEFAULT 0 CHECK(read IN (0, 1)),
    created_at TEXT NOT NULL
);

CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

Migration file: `migrations/002-notifications.sql`.

### 2. REST endpoints

| Method   | Path                           | Description                          |
| -------- | ------------------------------ | ------------------------------------ |
| `GET`    | `/api/notifications`           | List notifications (newest first)    |
| `POST`   | `/api/notifications`           | Create a notification                |
| `PATCH`  | `/api/notifications/:id/read`  | Mark notification as read            |
| `DELETE` | `/api/notifications/:id`       | Dismiss (delete) a notification      |

`GET` supports optional query params: `?read=0` (unread only), `?limit=50` (default 50, max 200).

### 3. SDK integration

Extension UI panels and lifecycle hooks can send notifications through the SDK:

```typescript
// In UI panels
sdk.notify({
  title: 'Sync Complete',
  message: '3 issues updated from Jira',
  variant: 'success',
  actionUrl: '/extensions/atlassian/panel',
});

// In lifecycle hooks (HookContext)
context.sdk.notify({
  title: 'Extension Initialized',
  message: 'hello-world v1.0.0 is ready',
  variant: 'info',
});
```

UI panels call `POST /api/notifications` via the API client. Server-side hooks write directly to SQLite through a `NotificationManager`.

### 4. Dashboard UI: notification bell in toolbar

The toolbar gains a notification bell icon button. The current text-label buttons (Marketplace, Terminal) are converted to icon-only buttons for visual consistency and space efficiency.

**Toolbar button order:** `[Bell] [Marketplace] [Terminal]`

| Button      | Icon             | Tooltip       |
| ----------- | ---------------- | ------------- |
| Bell        | `Bell` (lucide)  | Notifications |
| Marketplace | `Package` (existing) | Marketplace   |
| Terminal    | `TerminalSquare` (existing) | Terminal      |

The Bell icon shows an unread count pill (red badge overlaying the icon) when there are unread notifications.

### 5. Notification dropdown panel

Clicking the Bell opens a dropdown panel listing notifications in reverse chronological order. Each notification shows:

- Extension icon + name (source)
- Title and message
- Variant indicator (color-coded: blue/info, green/success, yellow/warning, red/error)
- Relative timestamp ("2 min ago", "1 hour ago")
- Read/unread state (bold for unread)

**Interactions:**

- Click a notification → if `actionUrl` is set, navigate to that path (e.g., `/extensions/atlassian/panel`); mark as read
- Click dismiss (X) → `DELETE /api/notifications/:id` → remove from list
- "Mark all as read" button → batch `PATCH` all unread → clear the unread count pill

### 6. Real-time delivery via WebSocket

Notifications are delivered in real-time through the existing inter-extension event bus (see ADR extensions/ADR-011). When `POST /api/notifications` creates a notification, the server publishes a `system:notification:created` event to the EventHub with the full notification payload.

The dashboard UI connects to `/api/events` WebSocket and subscribes to `system:notification:*`. When an event arrives, it invalidates the React Query notification cache, triggering an instant refetch. This replaces polling — no `refetchInterval` is used.

**Browser notifications**: On first dashboard visit, the UI requests browser `Notification` permission. When new unread notifications arrive (detected via the WebSocket-driven cache invalidation), the UI fires native browser notifications with the same title and message. This ensures users see time-sensitive notifications even when the dashboard tab is in the background.

**Reconnection**: The WebSocket auto-reconnects after unexpected close (3s backoff). Initial page load fetches data via REST; WebSocket handles all subsequent updates.

### 7. Notification cleanup

Notifications accumulate over time. To prevent unbounded growth:

- Auto-delete read notifications older than 30 days (checked on server startup and daily via a lightweight timer)
- Hard cap of 1000 notifications — oldest are deleted when the cap is exceeded
- Users can manually dismiss individual notifications or clear all

### 8. Notifications vs. events

Notifications and events serve different purposes:

| Aspect      | Events                                | Notifications                          |
| ----------- | ------------------------------------- | -------------------------------------- |
| Audience    | Other extensions                      | The user                               |
| Persistence | Fire-and-forget (no storage)          | Stored in SQLite until dismissed       |
| Transport   | WebSocket (real-time)                 | REST API + WebSocket push              |
| Purpose     | Cross-extension coordination          | User-facing status updates             |
| Visibility  | Invisible to users                    | Displayed in notification center       |

An extension might publish an event *and* send a notification for the same action — e.g., publish `ext:atlassian:sync-complete` (for other extensions to react) and notify "Sync Complete — 3 issues updated" (for the user to see).

## Consequences

### Positive

- **Persistent feed**: Users never miss important extension activity — notifications persist until dismissed.
- **Actionable**: `actionUrl` links notifications to the relevant extension panel for immediate follow-up.
- **Real-time delivery**: WebSocket push via `system:notification:created` events gives instant delivery — no polling delay.
- **Simple API**: `sdk.notify()` is a single method call — minimal friction for extension authors.
- **Icon-only toolbar**: Converting to icon-only buttons creates a cleaner, more scalable toolbar that accommodates the new bell without crowding.

### Negative

- **New DB migration**: `002-notifications.sql` adds a table and indexes, requiring migration handling for existing installs.
- **WebSocket dependency**: Real-time delivery requires a persistent WebSocket connection to `/api/events`. If the connection drops, notifications are only visible on next page load or after reconnection (auto-reconnect with 3s backoff).
- **Toolbar change**: Converting Marketplace and Terminal to icon-only buttons requires tooltips for discoverability. Users familiar with text labels may need adjustment.
- **Notification fatigue**: Extensions that over-notify can flood the feed. No rate limiting is imposed in this phase — may need per-extension throttling later.
- **Cleanup complexity**: The 30-day auto-delete and 1000-entry cap add maintenance logic to the server.

## Related Decisions

- extensions/ADR-011: Inter-Extension Events — defines the event bus that coexists with notifications
- dashboard/ADR-001: Localhost Web Dashboard — notifications are part of the dashboard SPA
- dashboard/ADR-002: Zero Business Logic — NotificationManager lives in CLI, server routes are thin proxies
- dashboard/ADR-006: Extension Widget Dashboard — toolbar layout is modified to accommodate the notification bell
