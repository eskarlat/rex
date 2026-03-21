# Data Flow Diagrams - Inter-Extension Events & Notification Center

## 1. Event Publishing & Delivery Flow

This diagram shows how events flow from a publishing extension through the server EventHub to all subscriber types.

```mermaid
flowchart TD
    A["Extension A (UI Panel)"] --> B["sdk.events.publish()"]
    B --> C["WebSocket connection"]
    C --> D["Server EventHub"]

    D --> E{Subscriber type}

    E -->|WebSocket client| F["WebSocket connection"]
    F --> G["Extension B (UI Panel)"]

    E -->|MCP extension| H["EventBus bridge"]
    H --> I["ConnectionManager"]
    I --> J["JSON-RPC notification\nvia stdio/SSE"]
    J --> K["MCP Extension C"]

    E -->|Standard extension| L["EventBus bridge"]
    L --> M["HookContext callback"]
    M --> N["Standard Extension D\n(onInit subscriber)"]
```

## 2. Notification Flow

This diagram shows how notifications are created, stored, and displayed to the user.

```mermaid
flowchart TD
    A["Extension"] --> B["sdk.notify()"]
    B --> C["POST /api/notifications"]
    C --> D["NotificationManager"]
    D --> E["SQLite\nnotifications table"]

    F["Dashboard UI"] --> G["GET /api/notifications\n(React Query polling)"]
    G --> E
    E --> H["Notification list\n(unread count pill)"]

    H --> I{User action}
    I -->|Click notification| J["Navigate to\nextension panel\n(actionUrl)"]
    I -->|Dismiss| K["DELETE\n/api/notifications/:id"]
    I -->|Mark as read| L["PATCH\n/api/notifications/:id/read"]

    K --> E
    L --> E
```

## 3. Event Protocol Messages

This diagram shows the four WebSocket message types in the event protocol.

```mermaid
flowchart LR
    subgraph "Client → Server"
        A["publish\n{ action: 'publish',\nevent: { type, data, source } }"]
        B["subscribe\n{ action: 'subscribe',\npatterns: string[] }"]
        C["unsubscribe\n{ action: 'unsubscribe',\npatterns: string[] }"]
    end

    subgraph "Server → Client"
        D["event\n{ action: 'event',\nevent: { type, data,\nsource, timestamp } }"]
    end

    A --> E["Server\nEventHub"]
    B --> E
    C --> E
    E --> D
```

## 4. LLM Agent Access Flow

This diagram shows how LLM agents interact with the event and notification systems through write-only CLI commands.

```mermaid
flowchart TD
    A["LLM Agent\n(SKILL.md)"]

    A --> B["renre-kit events:publish"]
    B --> C["HTTP POST\n/api/events"]
    C --> D["Server EventHub"]
    D --> E["All subscribers\n(WebSocket + MCP)"]

    A --> F["renre-kit notify"]
    F --> G["HTTP POST\n/api/notifications"]
    G --> H["SQLite\nnotifications table"]
    H --> I["Dashboard\nnotification bell"]

    A --> J["renre-kit logs:write"]
    J --> K["HTTP POST\n/api/logs/write"]
    K --> L["Log file\n(existing endpoint)"]

    style A fill:#f9f,stroke:#333
    N["Note: All write-only.\nLLMs cannot read events,\nnotifications, or subscribe."]
    style N fill:#fff,stroke:#999,stroke-dasharray: 5 5
```
