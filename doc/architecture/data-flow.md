# Data Flow

This page traces how data flows through RenreKit for common operations. Understanding these flows helps you debug issues and build extensions that work with the system.

## CLI Command Flow

When a user runs a command like `renre-kit github:pr-list`:

```mermaid
sequenceDiagram
    actor User
    participant CMD as Commander.js
    participant REG as Command Registry
    participant CONN as Connection Manager
    participant MCP as MCP Server

    User->>CMD: renre-kit github:pr-list
    CMD->>REG: lookup "github:pr-list"
    REG-->>CMD: github-mcp extension, MCP tool

    CMD->>CONN: execute tool "pr-list"
    alt Server not running
        CONN->>MCP: Spawn child process
    end
    CONN->>MCP: JSON-RPC tools/call
    MCP-->>CONN: Result
    CONN-->>CMD: Formatted output
    CMD-->>User: Display result
```

## Dashboard Request Flow

When the dashboard UI makes an API call:

```mermaid
sequenceDiagram
    participant UI as React UI
    participant RQ as React Query
    participant API as Fastify API
    participant MGR as CLI Manager
    participant DB as SQLite / FS

    UI->>RQ: trigger action
    RQ->>API: GET /api/extensions<br/>X-RenreKit-Project header
    API->>MGR: manager.list()
    MGR->>DB: query data
    DB-->>MGR: results
    MGR-->>API: structured data
    API-->>RQ: JSON response
    RQ-->>UI: update cache & render
```

## Extension Installation Flow

When a user runs `renre-kit ext:add github-mcp`:

```mermaid
flowchart TD
    A["ext:add github-mcp"] --> B[Search all registries]
    B --> C["Find github-mcp in<br/>.renre-kit/extensions.json"]
    C --> D["Pick latestVersion: 1.0.0"]
    D --> E["Git clone at tag v1.0.0"]
    E --> F["Clone to ~/.renre-kit/extensions/<br/>github-mcp@1.0.0/"]
    F --> G[Validate manifest.json<br/>Zod + engine constraints]
    G --> H[Register in SQLite]
    H --> I["Installed github-mcp@1.0.0"]

    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style G fill:#818cf8,stroke:#6366f1,color:#fff
    style I fill:#22c55e,stroke:#16a34a,color:#fff
```

## Extension Activation Flow

When a user runs `renre-kit ext:activate github-mcp`:

```mermaid
flowchart TD
    A["ext:activate github-mcp"] --> B{"Installed globally?"}
    B -- Yes --> C["Pin version in<br/>.renre-kit/plugins.json"]
    B -- No --> ERR["Error: not installed"]
    C --> D["Load main entry point"]
    D --> E["Call onInit(context)"]
    E --> F["Deploy agent assets<br/>.agents/skills/github/SKILL.md"]
    E --> G["Register commands<br/>in Command Registry"]
    F --> H["Activated github-mcp"]
    G --> H

    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style E fill:#818cf8,stroke:#6366f1,color:#fff
    style H fill:#22c55e,stroke:#16a34a,color:#fff
    style ERR fill:#ef4444,stroke:#dc2626,color:#fff
```

## Config Resolution Flow

When an extension reads a config value:

```mermaid
flowchart TD
    A["Extension accesses config.githubToken"] --> B{"Project override?<br/>.renre-kit/manifest.json"}
    B -- Found --> Z[Return value]
    B -- Not found --> C{"Global config?<br/>~/.renre-kit/config.json"}
    C -- Found --> Z
    C -- Not found --> D{"Schema default?"}
    D -- Found --> E{"secret: true?"}
    D -- Not found --> F[Return undefined]
    E -- No --> Z
    E -- Yes --> G["Vault lookup<br/>vaultHint: GITHUB_TOKEN"]
    G --> H["Decrypt with AES-256-GCM"]
    H --> Z

    style A fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style H fill:#818cf8,stroke:#6366f1,color:#fff
    style Z fill:#22c55e,stroke:#16a34a,color:#fff
```

## MCP Connection Lifecycle

How the Connection Manager handles MCP servers:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Spawning: First tool call
    Spawning --> Ready: Server starts
    Ready --> Processing: Tool call
    Processing --> Ready: Response received
    Ready --> Idle: 30s idle timeout
    Idle --> Spawning: Next tool call

    Ready --> Restarting: Server crashes
    Restarting --> Ready: Retry succeeds
    Restarting --> Failed: Max 3 retries exceeded

    state Restarting {
        [*] --> Retry1: immediate
        Retry1 --> Retry2: after 1s
        Retry2 --> Retry3: after 2s
    }
```

## WebSocket Log Streaming

How live logs reach the dashboard:

```mermaid
sequenceDiagram
    participant EXT as Extension / Core
    participant LOG as Pino Logger
    participant FILE as Log File
    participant WS as WebSocket Server
    participant UI as Dashboard UI

    EXT->>LOG: write log entry
    LOG->>FILE: ~/.renre-kit/logs/YYYY-MM-DD.log
    LOG->>WS: broadcast to connected clients
    WS->>UI: push log entry
    UI->>UI: append to log viewer (xterm.js)
```
