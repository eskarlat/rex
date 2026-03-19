# Data Flow Diagrams - RenreKit Architecture

## 1. Command Execution Flow

This diagram illustrates the complete lifecycle of a user command from CLI input through execution and output.

```mermaid
flowchart TD
    A["User enters command"] --> B["CLI Parser"]
    B --> C["Command Registry"]
    C --> D{Check command type}

    D -->|Standard command| E["require() handler"]
    E --> F["Execute command"]
    F --> G["Return result"]

    D -->|MCP command| H["ConnectionManager"]
    H --> I{Server running?}
    I -->|No| J["Spawn/Connect server"]
    I -->|Yes| K["Use existing connection"]
    J --> L["Send JSON-RPC tools/call"]
    K --> L
    L --> M["Return JSON-RPC response"]

    G --> N["Output to user"]
    M --> N
```

## 2. Extension Installation Flow

This diagram shows the process of installing and activating extensions through the CLI.

```mermaid
flowchart TD
    A["User runs ext:add"] --> B["CLI checks registries<br/>in priority order"]
    B --> C["Find match in<br/>extensions.json"]
    C --> D["git clone --branch v{version}<br/>--depth 1"]
    D --> E["Extract to<br/>~/.renre-kit/extensions/{name}@{version}/"]
    E --> F["Record in<br/>installed_extensions table"]
    F --> G{In project<br/>context?}

    G -->|No| H["Done"]
    G -->|Yes| I["Activate extension"]
    I --> J["Copy SKILL.md"]
    J --> K["Copy agent/ assets<br/>via onInit export"]
    K --> L["Update plugins.json"]
    L --> H
```

## 3. Dashboard Request Flow

This diagram depicts how browser requests flow through the Fastify server and interact with core managers.

```mermaid
flowchart TD
    A["Browser request"] --> B["Fastify Server"]
    B --> C["Extract X-RenreKit-Project<br/>header"]
    C --> D["Route to handler"]
    D --> E["Handler calls Core Manager"]

    E --> F{Manager type}
    F -->|ProjectManager| G["Read/write SQLite<br/>or filesystem"]
    F -->|ExtensionManager| G
    F -->|ConnectionManager| G
    F -->|Vault| G

    G --> H["Response as JSON"]
    H --> I["Browser renders<br/>React UI"]

    J["Extension UI panels<br/>loaded via dynamic import()"] -.-> K["Render in React tree"]
    I -.-> K
```

## 4. Scheduler Execution Flow

This diagram shows the scheduler's tick loop and task execution lifecycle.

```mermaid
flowchart TD
    A["SchedulerManager tick loop<br/>60s interval"] --> B["Query enabled tasks<br/>from SQLite"]
    B --> C["Compare next_run_at<br/>with current time"]
    C --> D{Task due?}

    D -->|No| A
    D -->|Yes| E["Resolve project config<br/>and vault"]
    E --> F["Execute command<br/>via Command Registry"]
    F --> G["Capture output"]
    G --> H["Write to<br/>task_history table"]
    H --> I["Update last_run_at and<br/>next_run_at in<br/>scheduled_tasks"]

    I --> J{Execution<br/>successful?}
    J -->|Yes| K["Task enabled for<br/>next run"]
    J -->|No| L["Record error status<br/>Task stays enabled"]

    K --> A
    L --> A
```

## 5. Config Resolution Flow

This diagram illustrates how configuration values are resolved with priority ordering and vault integration.

```mermaid
flowchart TD
    A["Extension requests<br/>config field"] --> B["Check project<br/>.renre-kit/manifest.json<br/>for override"]
    B --> C{Override<br/>found?}

    C -->|Yes| D["Use override value"]
    C -->|No| E["Check ~/.renre-kit/config.json<br/>global config"]

    E --> F{Global config<br/>exists?}
    F -->|Yes| G["Use global value"]
    F -->|No| H["Use config.schema<br/>default value"]

    D --> I{Vault-mapped<br/>field?}
    G --> I
    H --> I

    I -->|Yes| J["Read vault key"]
    J --> K{Secret<br/>field?}
    K -->|Yes| L["Decrypt value"]
    L --> M["Resolved value"]
    I -->|No| M
    K -->|No| M

    M --> N["Inject into<br/>ExecutionContext or<br/>MCP env variables"]
```
