# ADR-002: Dashboard as Pure API Proxy with Zero Business Logic

## Status

Accepted

## Context

The CLI core maintains managers for projects, extensions, connections, and vault operations. If the dashboard duplicates this logic, the two interfaces (CLI and dashboard) can drift, causing bugs and maintenance burden. Users expect perfect parity between `renre` CLI commands and dashboard actions.

## Decision

The dashboard has zero business logic. It is a pure REST/HTTP translation layer that:

1. Every dashboard action translates directly to calling the same ProjectManager, ExtensionManager, ConnectionManager, or Vault methods used by the CLI
2. Fastify server routes are thin adapters that parse requests, call managers, and serialize responses
3. No local state is maintained in the dashboard; all state is queried fresh from managers
4. The JavaScript SDK (if used) wraps these same manager calls, further reducing duplication

This ensures that `renre extension activate foo` and clicking "Activate" in the dashboard call the exact same code path.

## Consequences

### Positive

- **Perfect CLI/Dashboard parity**: Same functionality, same bugs, same fixes
- **Single source of truth**: All business logic in managers, one place to update
- **Simplified reasoning**: Dashboard behavior is predictable; no special cases
- **Easier testing**: Can test managers independently of UI

### Negative

- **No local optimistic updates**: Every action requires an API round-trip
- **Network latency**: Dashboard users experience network delays even on localhost
- **Complex async state**: Must handle loading states for every action
- **React state complexity**: No local caching; all state comes from API responses
- **Poor offline experience**: Dashboard cannot function without connectivity to managers
