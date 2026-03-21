# ADR-004: Schema Versioning & File Migration Framework

## Status

Proposed

## Context

`config.json` and `vault.json` are the two JSON files that persist global state outside the database. Neither file carries a version marker today. If the shape of either file changes — new fields, renamed keys, restructured nesting — there is no automated path from the old format to the new one. Users must manually edit files or delete and recreate them, losing configuration and secrets.

The database already has a migration system (SQL files applied sequentially), but the JSON files have no equivalent. As the project approaches npm publish, the likelihood of post-release schema changes is high (e.g., adding scheduler preferences to config, or restructuring vault entries for multi-project scoping). Without versioned schemas and a migration pipeline, every breaking change becomes a support burden.

Specific gaps:

- **config.json**: Flat `GlobalConfig` object. No way to detect whether a file predates a format change.
- **vault.json**: Flat `Record<string, VaultEntry>`. Adding top-level metadata (e.g., schema version, key rotation timestamp) requires wrapping in a new structure — a breaking change with no migration path.
- **No backup before overwrite**: Config and vault writes use atomic `writeFileSync` with no pre-write backup, so a bug in a migration function could destroy the only copy of user data.

## Decision

### 1. Add `schemaVersion` to both files

**config.json** adds a top-level integer field:

```typescript
interface GlobalConfig {
  schemaVersion: number; // starts at 1
  // ... existing fields unchanged
}
```

**vault.json** wraps from a flat record to a versioned envelope:

```typescript
// Before (version 0, implicit):
Record<string, VaultEntry>;

// After (version 1+):
interface VaultFile {
  schemaVersion: number;
  entries: Record<string, VaultEntry>;
}
```

Files without `schemaVersion` are treated as **version 0** (the pre-versioning format).

### 2. Migration pipeline

Each file type has an ordered array of migration functions:

```typescript
type MigrationFn = (data: unknown) => unknown;

// features/config/migrations/index.ts
export const configMigrations: MigrationFn[] = [
  migrateV0toV1, // wrap with schemaVersion, set defaults for new fields
  // future: migrateV1toV2, etc.
];

// features/vault/migrations/index.ts
export const vaultMigrations: MigrationFn[] = [
  migrateV0toV1, // wrap flat record in { schemaVersion, entries }
];
```

### 3. Migration execution on load

```typescript
function migrateFile(filePath: string, data: unknown, migrations: MigrationFn[]): unknown {
  const currentVersion =
    typeof data === 'object' && data !== null && 'schemaVersion' in data
      ? (data as { schemaVersion: number }).schemaVersion
      : 0;

  if (currentVersion >= migrations.length) return data; // up to date

  // Backup before migrating
  const backupPath = `${filePath}.bak`;
  fs.copyFileSync(filePath, backupPath);

  let migrated = data;
  for (let v = currentVersion; v < migrations.length; v++) {
    migrated = migrations[v]!(migrated);
  }

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  return migrated;
}
```

Triggered inside `loadGlobalConfig()` and `readVault()` — the two existing entry points for reading these files.

### 4. Migration function co-location

```
features/config/migrations/
  v0-to-v1.ts
  index.ts          # exports ordered array
features/vault/migrations/
  v0-to-v1.ts
  index.ts
```

Each migration file exports a single function. The index re-exports them in order. This keeps migrations small, testable, and auditable.

## Consequences

### Positive

- **Forward-compatible format**: Any future schema change can be handled automatically — users never need to manually edit config or vault files
- **Safe migration**: `.bak` file preserves the pre-migration state; if something goes wrong, recovery is possible
- **Version detection**: `schemaVersion: 0` (implicit) handles all existing installations without special-casing
- **Testable**: Each migration function is a pure `(data: unknown) => unknown` transform — easy to unit test with snapshot data
- **Consistent pattern**: Mirrors the database migration approach (sequential, ordered, one-way)

### Negative

- **Load-time overhead**: Every `loadGlobalConfig()` / `readVault()` call checks the version. Negligible for JSON files but adds a code path.
- **Vault envelope is a breaking change**: Wrapping the flat record requires the v0→v1 migration to run before any vault operation. If a user downgrades the CLI, the new format will be unreadable. Mitigation: the `.bak` file preserves the old format.
- **Backup file management**: `.bak` files accumulate if migrations run frequently during development. Only the most recent `.bak` is kept per file.

## Alternatives Considered

- **Database-only storage**: Move config and vault into SQLite. Rejected because config.json is human-editable (users inspect/modify it directly) and vault.json has specialized encryption requirements that don't map well to SQLite columns.
- **Inline version comment**: Add `// version: 1` as a JSON comment. Rejected because JSON does not support comments; would require a custom parser.
- **No migration, append-only fields**: Only add new optional fields, never change existing ones. Rejected because it leads to permanent cruft and prevents meaningful restructuring (like the vault envelope).

## Related Decisions

- core/ADR-002: SQLite Project Registry — database has its own migration system; this ADR covers the JSON files
- vault/ADR-002: AES-256-GCM Encryption — vault format change must preserve encrypted entries
- → core/ADR-006: Resilient Database Migrations — complementary; both address migration safety
- → core/ADR-007: Doctor Diagnostic Command — doctor checks that schemaVersion is current
