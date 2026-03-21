# ADR-011: Inter-Extension Events

## Status

Proposed

## Context

Extensions currently operate as isolated silos. The SDK's `EventsAPI` creates an in-memory event bus per extension instance — events published by one extension are invisible to all others. There is no pub/sub mechanism for cross-extension coordination, no way for extensions to react to each other's state changes, and no unified notification feed for users.

Real-world use cases that are blocked:

- **Atlassian creates a Jira ticket → GitHub auto-links a branch**: The GitHub extension cannot listen for Jira ticket creation events.
- **Scheduler task completes → user gets a notification**: No channel exists for the scheduler to push persistent messages to the user.
- **Extension status changes → dependent extensions react**: Activating or deactivating an extension emits no event that other extensions can observe.
- **LLM agent completes a task → other extensions coordinate follow-up**: Agents have no way to publish events or notify users programmatically.

The system needs a unified event transport that works across all extension types (standard, MCP stdio, MCP SSE) and across all interaction modes (CLI, dashboard, LLM agents).

## Decision

### 1. Server-centric WebSocket event bus

The dashboard server hosts a singleton `EventHub` (module-level state, following the `console-capture.ts` pattern). The EventHub manages subscriptions and routes events between all connected clients.

A new WebSocket endpoint `/api/events` accepts connections from extension UIs and the SDK. The protocol uses JSON messages with four action types:

```typescript
// Client → Server
{ action: 'publish', event: { type: string, data: unknown, source: string } }
{ action: 'subscribe', patterns: string[] }
{ action: 'unsubscribe', patterns: string[] }

// Server → Client
{ action: 'event', event: { type: string, data: unknown, source: string, timestamp: string } }
```

### 2. Event namespacing

Events are namespaced as `ext:{extensionName}:{eventName}`. Extensions emit under their own namespace and can listen to any namespace. Lifecycle events use system namespaces: `system:project:init`, `system:ext:activate`, `system:ext:deactivate`.

Pattern matching supports `*` wildcards: `ext:atlassian:*` matches all Atlassian events, `ext:*:error` matches error events from any extension.

### 3. SDK integration

The SDK gains a `publish()` method alongside existing `on()`/`off()`. When the dashboard server is running, these methods route through the WebSocket connection for cross-extension delivery. In CLI-only mode (no server), events remain local to the extension instance.

```typescript
// In extension UI panels
sdk.events.publish('task-complete', { taskId: '123' });
sdk.events.on('ext:atlassian:ticket-created', handler);
sdk.events.off('ext:atlassian:ticket-created', handler);

// React hook
const { lastEvent, events } = useEvents('ext:atlassian:*');
```

### 4. Standard extension integration

Standard extensions receive `sdk.events` in their `HookContext` during lifecycle hooks:

```typescript
export function onInit(context: HookContext): void {
  context.sdk.events.publish('initialized', { version: '1.0.0' });
  context.sdk.events.on('ext:other-ext:data-ready', handleDataReady);
}
```

### 5. MCP extension integration

MCP extensions receive events as JSON-RPC `notifications/event` messages delivered by the `ConnectionManager` through their stdio/SSE transport:

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/event",
  "params": {
    "type": "ext:atlassian:ticket-created",
    "data": { "ticketId": "PROJ-123" },
    "source": "atlassian",
    "timestamp": "2026-03-21T10:00:00Z"
  }
}
```

The ConnectionManager subscribes to relevant patterns on behalf of MCP extensions and bridges events from the EventHub to the MCP process.

### 6. Lifecycle event bridging

Existing lifecycle events (`ext:activate`, `ext:deactivate`, `project:init`) are bridged to the event bus via `EventBus.setBridge()`. When the server starts, it registers a bridge callback that forwards lifecycle events through the EventHub to all WebSocket subscribers and MCP extensions.

```typescript
EventBus.setBridge((event, data) => {
  eventHub.publishEvent({
    type: `system:${event}`,
    data,
    source: 'system',
  });
});
```

### 7. User notification channel

Extensions can push persistent notifications to the user via `sdk.notify()`. Notifications are stored in a new `notifications` SQLite table and displayed in the dashboard notification center (see ADR dashboard/ADR-007).

```typescript
sdk.notify({
  title: 'Sync Complete',
  message: '3 issues updated from Jira',
  variant: 'success',
  actionUrl: '/extensions/atlassian/panel',
});
```

Notifications are distinct from events: events are fire-and-forget inter-extension messages; notifications are persistent user-facing items.

### 8. LLM CLI commands (write-only)

LLM agents interact with the event system and notifications through CLI commands. These are **write-only** — agents can publish events and send notifications but cannot read, subscribe, or query them.

- `renre-kit events:publish <type> [--data '{}'] [--source <name>]` — publish an event to the bus (requires dashboard server running, sends HTTP POST to `/api/events`)
- `renre-kit notify <title> <message> [--variant info] [--source <name>] [--action-url <path>]` — create a persistent notification (HTTP POST to `/api/notifications`)
- `renre-kit logs:write <level> <source> <message> [--data '{}']` — write a log entry (reuses existing `POST /api/logs/write` endpoint, level: debug/info/warn/error, source must start with `ext:`)

These commands send HTTP requests to the dashboard server. The server must be running for `events:publish`; `notify` can also write directly to SQLite when running in CLI context.

### 9. No event persistence or replay

Events are fire-and-forget. There is no event store, no replay mechanism, and no guaranteed delivery. If no subscriber is listening when an event fires, the event is lost. Only notifications are persisted (in SQLite). This keeps the system simple and avoids the complexity of event sourcing.

## Consequences

### Positive

- **Cross-extension coordination**: Extensions can react to each other's state changes without tight coupling.
- **Unified transport**: One event bus serves all extension types (standard, MCP stdio, MCP SSE) and all interaction modes (UI, lifecycle hooks, CLI).
- **User visibility**: Persistent notifications give users a feed of extension activity they can review at their convenience.
- **LLM integration**: Agents can publish events and notify users, enabling richer automation workflows.
- **Greenfield API**: No backward compatibility needed — `publish()` replaces `emit()` as a single unified method.
- **Pattern matching**: Wildcard subscriptions allow extensions to listen broadly or narrowly as needed.

### Negative

- **Server dependency**: Cross-extension events require the dashboard server to be running. CLI-only mode falls back to local-only events.
- **New DB table**: The `notifications` table requires a new migration (`002-notifications.sql`).
- **No persistence/replay**: Events are fire-and-forget. Extensions that start after an event fires will not receive it.
- **WebSocket complexity**: Managing WebSocket connections, reconnection, and subscription state adds implementation surface area.
- **MCP bridging overhead**: The ConnectionManager must proxy events between the EventHub and MCP processes, adding a translation layer.

## Alternatives Considered

- **Shared in-memory bus (no WebSocket)**: All extensions share a single `EventEmitter` in the server process. Simpler, but doesn't work for extension UI panels (which run in the browser) or MCP extensions (which run as separate processes). The WebSocket approach unifies all transport modes.
- **Redis/message queue**: External message broker for guaranteed delivery and persistence. Over-engineered for a local dev tool — adds infrastructure dependency, operational complexity, and startup latency.
- **HTTP polling for events**: Extensions poll `GET /api/events` instead of WebSocket. Higher latency, more server load, and awkward for real-time coordination. WebSocket is the natural fit for push-based event delivery.
- **Extension-to-extension direct calls**: Extensions import each other's APIs directly. Creates tight coupling, dependency ordering issues, and doesn't work for MCP extensions.

## Related Decisions

- dashboard/ADR-007: Notification Center — defines the UI and persistence layer for user notifications
- dashboard/ADR-002: Zero Business Logic — events route through CLI managers, server remains a thin proxy
- extensions/ADR-002: Extension Types — event delivery must work across standard, MCP stdio, and MCP SSE types
- extensions/ADR-008: Single Main Entry Point — lifecycle hooks receive `sdk.events` in HookContext
