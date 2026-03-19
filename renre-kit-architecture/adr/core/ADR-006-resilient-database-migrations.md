# ADR-006: Resilient Database Migrations

## Status
Proposed

## Context
The CLI uses SQLite (via better-sqlite3) with migration files applied sequentially on startup. The current migration runner executes raw SQL statements but does **not** wrap them in transactions. If a migration partially succeeds — for example, a `CREATE TABLE` succeeds but a subsequent `CREATE INDEX` fails — the database is left in an inconsistent state: some schema changes applied, others not, and the migration is not recorded as complete. Re-running the migration then fails because the already-created table conflicts.

Additionally, there is no pre-migration backup. A failed migration requires manual intervention (deleting the database and losing all project/extension data) because there is no rollback path.

This is acceptable during development but unacceptable for a published tool where users have real data in their databases.

## Decision

### 1. Wrap each migration in a better-sqlite3 transaction

```typescript
function runMigrations(db: Database): void {
  const pending = getPendingMigrations(db);
  if (pending.length === 0) return;

  // Backup before running any migrations
  backupDatabase(db);

  for (const migration of pending) {
    const runInTransaction = db.transaction(() => {
      db.exec(migration.sql);
      db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)')
        .run(migration.name, new Date().toISOString());
    });

    runInTransaction();
  }
}
```

better-sqlite3's `transaction()` method wraps the callback in `BEGIN IMMEDIATE` / `COMMIT`, with automatic `ROLLBACK` if the callback throws. This ensures that either **all** statements in a migration succeed (and the migration is recorded) or **none** do.

### 2. Backup before pending migrations

```typescript
function backupDatabase(db: Database): void {
  const dbPath = db.name; // better-sqlite3 exposes the file path
  const backupPath = `${dbPath}.bak`;

  // Use better-sqlite3's backup API for a consistent snapshot
  db.backup(backupPath)
    .then(() => {
      logger.info(`Database backed up to ${backupPath}`);
    })
    .catch((err: unknown) => {
      logger.warn(`Database backup failed: ${String(err)}`);
      // Continue with migration — backup failure should not block
    });
}
```

Alternatively, for synchronous simplicity:

```typescript
import { copyFileSync } from 'node:fs';

function backupDatabaseSync(dbPath: string): void {
  const backupPath = `${dbPath}.bak`;
  copyFileSync(dbPath, backupPath);
  logger.info(`Database backed up to ${backupPath}`);
}
```

The synchronous `copyFileSync` approach is simpler and sufficient for the small database sizes expected in a CLI tool. Only the **most recent** `.bak` is kept — each backup overwrites the previous one.

Backup is **only triggered when pending migrations exist**, not on every startup.

### 3. Migration recording in `_migrations` table

The `_migrations` table tracks which migrations have been applied:

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

This table is created by the migration runner itself if it does not exist. Each migration's name (e.g., `001-initial-schema`) is recorded atomically alongside the SQL execution within the same transaction.

### 4. Error reporting

If a migration fails after rollback, the error message includes:
- Which migration failed (file name)
- The SQLite error message
- The backup file path for manual recovery

```typescript
try {
  runInTransaction();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  throw new Error(
    `Migration "${migration.name}" failed: ${message}. ` +
    `Database has been rolled back. ` +
    `Pre-migration backup available at: ${backupPath}`
  );
}
```

## Consequences

### Positive
- **Atomic migrations**: A failed migration leaves the database exactly as it was before the attempt — no half-applied schema changes
- **Recoverable**: The `.bak` file provides a manual recovery path even in catastrophic scenarios (e.g., a bug in the migration runner itself)
- **Minimal overhead**: `BEGIN IMMEDIATE` / `COMMIT` is essentially free in SQLite for DDL-only migrations
- **Clear diagnostics**: Error messages tell users exactly what failed and where to find the backup
- **No new dependencies**: better-sqlite3 already provides `transaction()` — this is a usage change, not an architectural one

### Negative
- **Backup disk usage**: Each migration run creates a full copy of the database. For the expected database sizes (< 1 MB), this is negligible.
- **Single `.bak` file**: Only the most recent backup is kept. If a user runs migrations, modifies data, then runs more migrations that fail, the intermediate state is lost. Acceptable for the CLI's use case; not suitable for a production database server.
- **DDL in transactions**: SQLite supports transactional DDL (unlike MySQL/PostgreSQL), so this works. But developers familiar with other databases may be surprised that `CREATE TABLE` can be rolled back.

## Alternatives Considered
- **WAL mode journaling**: SQLite's WAL mode provides crash recovery but not logical rollback of partial migrations. It protects against power loss, not application-level errors.
- **Numbered backup files** (`db.sqlite.bak.1`, `.bak.2`, etc.): More recovery points but adds complexity for managing old backups. Not justified for a CLI tool's small database.
- **Down migrations**: Generating reverse SQL for each migration (like Prisma or Flyway). Significant complexity for a tool that primarily adds tables/columns and rarely removes them. The backup approach is simpler and covers more failure modes.

## Related Decisions
- core/ADR-002: SQLite Project Registry — defines the database and table structure
- → core/ADR-004: Schema Versioning & Migration Framework — complementary; ADR-004 covers JSON file migrations, this ADR covers SQLite
- → core/ADR-007: Doctor Diagnostic Command — doctor verifies no pending migrations and database integrity
