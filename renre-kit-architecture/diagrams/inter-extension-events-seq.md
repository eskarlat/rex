# Inter-Extension Events - Sequence Diagrams

## 1. Extension A Publishes, Extension B Receives (UI-to-UI)

```mermaid
sequenceDiagram
    participant A as Extension A Panel
    participant SDK_A as SDK (Extension A)
    participant WS as WebSocket
    participant Hub as Server EventHub
    participant WS_B as WebSocket
    participant SDK_B as SDK (Extension B)
    participant B as Extension B Panel

    A->>SDK_A: sdk.events.publish('task-complete', { taskId: '123' })
    SDK_A->>WS: { action: 'publish', event: { type: 'ext:extA:task-complete', data, source: 'extA' } }
    WS->>Hub: Route to EventHub
    Hub->>Hub: Match subscribers for 'ext:extA:*'
    Hub->>WS_B: { action: 'event', event: { type, data, source, timestamp } }
    WS_B->>SDK_B: Deliver event
    SDK_B->>B: Invoke registered handler
```

## 2. Extension Publishes, MCP Extension Receives

```mermaid
sequenceDiagram
    participant A as Extension A
    participant SDK as SDK
    participant WS as WebSocket
    participant Hub as Server EventHub
    participant Bridge as EventBus Bridge
    participant CM as ConnectionManager
    participant MCP as MCP Process (stdin)

    A->>SDK: sdk.events.publish('ticket-created', { ticketId: 'PROJ-123' })
    SDK->>WS: { action: 'publish', event }
    WS->>Hub: Route to EventHub
    Hub->>Bridge: Forward to EventBus bridge
    Bridge->>CM: Deliver event for MCP extension
    CM->>CM: Check MCP extension subscriptions
    CM->>MCP: JSON-RPC notification via stdin
    Note over MCP: { "jsonrpc": "2.0",<br/>"method": "notifications/event",<br/>"params": { type, data, source } }
```

## 3. Extension Sends Notification to User

```mermaid
sequenceDiagram
    participant Ext as Extension
    participant SDK as SDK
    participant API as Server API
    participant DB as SQLite
    participant RQ as React Query
    participant Bell as Toolbar Bell
    participant Toast as Toast System
    participant User as User

    Ext->>SDK: sdk.notify({ title, message, variant: 'success', actionUrl })
    SDK->>API: POST /api/notifications
    API->>DB: INSERT INTO notifications
    DB-->>API: { id, ... }
    API-->>SDK: 201 Created

    RQ->>API: GET /api/notifications (polling)
    API->>DB: SELECT * FROM notifications
    DB-->>API: notification rows
    API-->>RQ: notification list
    RQ->>Bell: Update unread count pill
    RQ->>Toast: Show toast (variant: success)

    User->>Bell: Click bell icon
    Bell->>Bell: Open dropdown panel
    User->>Bell: Click notification
    Bell->>API: PATCH /api/notifications/:id/read
    Bell->>Bell: Navigate to actionUrl

    User->>Bell: Click dismiss (X)
    Bell->>API: DELETE /api/notifications/:id
    API->>DB: DELETE FROM notifications WHERE id = :id
```

## 4. Lifecycle Event Bridging

```mermaid
sequenceDiagram
    participant Route as Server Route
    participant EM as ExtensionManager
    participant EB as EventBus
    participant Bridge as setBridge callback
    participant Hub as EventHub
    participant WS as WebSocket Subscribers
    participant CM as ConnectionManager
    participant MCP as MCP Extensions

    Route->>EM: activate(extensionName)
    EM->>EM: Load extension, run onInit
    EM->>EB: emit('ext:activate', { name, version })
    EB->>Bridge: Bridge callback invoked
    Bridge->>Hub: publishEvent({ type: 'system:ext:activate', data, source: 'system' })
    Hub->>WS: { action: 'event', event }
    Hub->>CM: Forward to MCP bridge
    CM->>MCP: JSON-RPC notifications/event
```

## 5. LLM Publishes Event via CLI

```mermaid
sequenceDiagram
    participant LLM as LLM Agent
    participant CLI as CLI (renre-kit events:publish)
    participant API as Server API
    participant Hub as EventHub
    participant WS as Extension UIs
    participant CM as ConnectionManager
    participant MCP as MCP Extensions

    LLM->>CLI: renre-kit events:publish ext:my-ext:task-done --data '{"result":"ok"}'
    CLI->>API: HTTP POST /api/events
    Note over CLI,API: { type: 'ext:my-ext:task-done',<br/>data: { result: 'ok' },<br/>source: 'my-ext' }
    API->>Hub: publishEvent(event)
    Hub->>WS: Deliver to WebSocket subscribers
    Hub->>CM: Forward to MCP bridge
    CM->>MCP: JSON-RPC notifications/event
    API-->>CLI: 200 OK
    CLI-->>LLM: Event published
```

## 6. LLM Sends Notification via CLI

```mermaid
sequenceDiagram
    participant LLM as LLM Agent
    participant CLI as CLI (renre-kit notify)
    participant API as Server API
    participant DB as SQLite
    participant RQ as React Query
    participant Bell as Toolbar Bell

    LLM->>CLI: renre-kit notify "Task Done" "Analysis complete" --variant success --source my-ext
    CLI->>API: HTTP POST /api/notifications
    Note over CLI,API: { title: 'Task Done',<br/>message: 'Analysis complete',<br/>variant: 'success',<br/>extension_name: 'my-ext' }
    API->>DB: INSERT INTO notifications
    DB-->>API: { id, ... }
    API-->>CLI: 201 Created
    CLI-->>LLM: Notification sent

    RQ->>API: GET /api/notifications (polling)
    API->>DB: SELECT * FROM notifications WHERE read = 0
    DB-->>API: notification rows
    API-->>RQ: notification list
    RQ->>Bell: Update unread count pill
```
