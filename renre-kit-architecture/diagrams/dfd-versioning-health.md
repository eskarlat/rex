# Data Flow Diagrams - Versioning & Health

## 1. Config/Vault Migration Flow

This diagram illustrates how `config.json` and `vault.json` are migrated when the CLI loads them and detects an outdated `schemaVersion`. See [ADR-004](../adr/core/ADR-004-schema-versioning-migration.md).

```mermaid
flowchart TD
    A["loadGlobalConfig() or\nreadVault() called"] --> B["Read JSON file\nfrom disk"]
    B --> C{File exists?}

    C -->|No| D["Return defaults\n(no migration needed)"]
    C -->|Yes| E["Parse JSON"]

    E --> F{Parse\nsuccessful?}
    F -->|No| G["Throw error:\ninvalid JSON"]
    F -->|Yes| H["Detect schemaVersion\n(missing = version 0)"]

    H --> I{Version\ncurrent?}
    I -->|Yes| J["Return parsed data"]

    I -->|No| K["Copy file to\n{path}.bak"]
    K --> L["Run migration\nfunctions sequentially:\nv0→v1, v1→v2, ..."]

    L --> M{All migrations\nsucceed?}
    M -->|Yes| N["Write migrated data\nto disk"]
    N --> J

    M -->|No| O["Throw error:\nmigration failed\n(.bak preserves\noriginal)"]

    style G fill:#fee,stroke:#c00
    style O fill:#fee,stroke:#c00
```

## 2. Database Migration Flow

This diagram shows how SQLite migrations run inside transactions with pre-migration backup. See [ADR-006](../adr/core/ADR-006-resilient-database-migrations.md).

```mermaid
flowchart TD
    A["CLI startup:\nrunMigrations(db)"] --> B["Query _migrations\ntable for applied\nmigrations"]
    B --> C["Compare against\nmigration files on disk"]
    C --> D{Pending\nmigrations?}

    D -->|No| E["Done — schema\nis current"]

    D -->|Yes| F["Backup db.sqlite\n→ db.sqlite.bak"]
    F --> G["Pick next pending\nmigration"]

    G --> H["BEGIN IMMEDIATE\ntransaction"]
    H --> I["Execute migration SQL"]
    I --> J["INSERT into\n_migrations table"]
    J --> K["COMMIT"]

    K --> L{More pending\nmigrations?}
    L -->|Yes| G
    L -->|No| E

    I -.->|SQL error| M["ROLLBACK\ntransaction"]
    M --> N["Throw error with:\n- migration name\n- SQLite error\n- backup path"]

    style N fill:#fee,stroke:#c00
```

## 3. Doctor Command Flow

This diagram depicts the sequential check execution and result aggregation of `renre doctor`. See [ADR-007](../adr/core/ADR-007-doctor-diagnostic-command.md).

```mermaid
flowchart TD
    A["User runs\nrenre doctor"] --> B["Initialize\nDoctorContext"]
    B --> C["Load ordered\ncheck array"]
    C --> D["Run next check"]

    D --> E{Check\nresult?}

    E -->|pass| F["Record ✓"]
    E -->|warn| G["Record !\nwith detail"]
    E -->|fail| H["Record ✗\nwith detail +\nremediation hint"]

    F --> I{More\nchecks?}
    G --> I
    H --> I

    I -->|Yes| D
    I -->|No| J["Print summary:\nN passed, N warnings,\nN failures"]

    J --> K{Any\nfailures?}
    K -->|No| L["Exit code 0"]
    K -->|Yes| M["Exit code 1"]

    style G fill:#ffd,stroke:#aa0
    style H fill:#fee,stroke:#c00
```
