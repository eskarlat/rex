# ADR-002: SQLite for Project Registry

## Status
Accepted

## Context
The CLI needs to track multiple projects with their associated metadata and perform fast lookups during command execution. Initial prototypes used JSON files, but this approach has limitations:
- Scanning directories for projects is O(n) and slow at scale
- Concurrent modifications risk corruption
- Query capabilities are limited to in-memory filtering

A database abstraction layer was considered but adds async complexity to what should be synchronous CLI operations.

## Decision
Use SQLite as the project registry:
- **Single file storage**: `~/.renre-kit/db.sqlite` contains all project metadata
- **Synchronous driver**: Use `better-sqlite3` for a synchronous, blocking API
- **Schema**: Projects table with columns: `id`, `name`, `path`, `created_at`, `updated_at`

## Consequences

### Positive
- Fast lookups: Indexed queries on project path are O(log n) instead of O(n)
- Concurrent safety: SQLite handles locking and transactions
- No async complexity: Synchronous API keeps CLI code simple and linear
- Single source of truth: One file to back up or share
- Native support: SQLite comes with Node.js ecosystem maturity

### Negative
- Native module compilation: `better-sqlite3` requires compilation; adds setup complexity and platform-specific binaries
- Locked file issues: SQLite locks can block operations if not managed carefully
- One-way migration: If we decide to change later, migrating projects out of the database is a one-time cost
- Storage overhead: SQLite has more overhead than a small JSON file for 1–2 projects

## Alternatives Considered
- **JSON files**: Simple, but no indexing and poor concurrency
- **PostgreSQL**: Overkill for a CLI tool; requires external service
- **Memory + file sync**: Risk of data loss and complexity

## Related Decisions
- ADR-001: Microkernel Architecture (projects activate extensions per-project)
