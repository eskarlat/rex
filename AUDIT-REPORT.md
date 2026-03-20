# RenreKit CLI — Full Project Audit Report

**Date:** 2026-03-20
**Scope:** All packages, extensions, build tooling, tests, and configuration
**Method:** Static code analysis, dependency audit, lint/typecheck/test/coverage/duplication runs

---

## Executive Summary

RenreKit CLI is a well-structured monorepo implementing a Microkernel (Plugin Architecture) pattern. The codebase demonstrates strong engineering discipline: strict TypeScript, 86%+ test coverage enforcement, comprehensive linting, and clear separation of concerns across 5 packages and 6 reference extensions.

**However, the audit identified 70+ findings across security, reliability, code quality, and operational readiness.** The most critical gaps are in the server package (missing request validation, weak authentication, CORS misconfiguration) and the CLI's MCP transport layer (missing timeouts, silent error swallowing).

### Health Dashboard

| Area | Status | Details |
|------|--------|---------|
| Build | PASS | All 11 tasks build successfully (18s) |
| Lint (ESLint) | PASS | Zero warnings across all 5 packages |
| Type Check | PASS | Zero errors across all 5 packages |
| Tests | PASS | 1,406 tests passing (63 CLI + 181 server + 355 UI + 159 SDK + 13 scaffold + 635 other) |
| Coverage | PASS | CLI 94.8%, Server 96.1%, UI (meets 86%), SDK 98.5%, Scaffold 100% |
| Dead Code (Knip) | FAIL | 32 unused files + 1 unused dependency (atlassian-mcp extension) |
| Duplication (jscpd) | PASS | 3.4% total (within threshold of 5) |
| Formatting (Prettier) | FAIL | 523 files need formatting (mostly architecture docs) |
| CI/CD | MISSING | No GitHub Actions workflows exist |

---

## 1. CRITICAL Findings (Fix Before Production)

### 1.1 Server: No Request Body Validation

**Severity:** CRITICAL
**Files:** All route handlers in `packages/server/src/features/`

Every endpoint uses unsafe `as` type assertions without runtime validation:

```typescript
// Example from extensions.routes.ts
const body = request.body as InstallBody; // No validation
```

This pattern repeats across **30+ endpoints** in: `extensions.routes.ts`, `projects.routes.ts`, `settings.routes.ts`, `vault.routes.ts`, `scheduler.routes.ts`, `registries.routes.ts`, `dashboard.routes.ts`, `commands.routes.ts`.

**Risk:** Malformed requests bypass TypeScript's compile-time checks at runtime, causing unhandled exceptions or data corruption.
**Fix:** Add Fastify JSON Schema validation or Zod schemas to all route handlers.

---

### 1.2 Server: CORS Accepts All Origins

**Severity:** CRITICAL
**File:** `packages/server/src/server.ts:33`

```typescript
await fastify.register(cors, { origin: true });
```

Combined with cookie-based LAN auth, this enables CSRF attacks from any website.
**Fix:** Restrict to `http://localhost:4201` or use environment-based whitelist.

---

### 1.3 Server: Path Traversal in Panel/Widget Serving

**Severity:** CRITICAL
**File:** `packages/server/src/features/extensions/extensions.routes.ts:118-142`

```typescript
const assetPath = join(extDir, asset.entry); // asset.entry from manifest, no sanitization
```

The icon serving code has proper path traversal checks (`isIconSafe()`), but the panel/widget asset serving does not. A malicious manifest could serve arbitrary files.
**Fix:** Add the same `path.relative()` containment check used for icons.

---

### 1.4 CLI: Missing Response Timeout for MCP Stdio

**Severity:** CRITICAL
**File:** `packages/cli/src/features/extensions/mcp/mcp-stdio-transport.ts:32-117`

`sendRequest()` creates a Promise that waits indefinitely for a matching JSON-RPC response. If the MCP child process hangs, the entire CLI hangs with no recovery path.

**Fix:** Add a configurable timeout (e.g., 30s) that rejects the promise and cleans up event listeners.

---

### 1.5 CLI: Vault Decrypt Missing Hex Validation

**Severity:** CRITICAL
**File:** `packages/cli/src/features/vault/vault-manager.ts:67-98`

`decrypt()` splits on `:` and passes directly to `Buffer.from(hex)` without validating the hex strings. Corrupted vault entries could cause silent failures.

**Fix:** Validate hex format with regex before Buffer.from() calls.

---

## 2. HIGH Findings

### 2.1 Server: Vault/Settings Endpoints Unauthenticated (Non-LAN Mode)

**Files:** `vault.routes.ts`, `settings.routes.ts`

When `lanMode: false`, all vault and settings endpoints are completely unprotected. `GET /api/vault` returns all secrets; `PUT /api/settings` accepts any config.

**Fix:** Always require authentication for admin endpoints, regardless of LAN mode.

---

### 2.2 Server: No Rate Limiting

**All routes** — No rate limiting middleware exists anywhere. The `/api/auth/pin` endpoint is particularly vulnerable since the PIN is only 4 digits (10,000 combinations).

**Fix:** Add `@fastify/rate-limit` globally and stricter limits on auth endpoints.

---

### 2.3 Server: Weak PIN Generator

**File:** `packages/server/src/core/utils/pin-generator.ts:3-6`

4-digit PIN = 10,000 combinations. Trivially brute-forceable without rate limiting.

**Fix:** Increase to 6+ digits and add lockout after failed attempts.

---

### 2.4 CLI: Silent Error Swallowing in Event Bus

**File:** `packages/cli/src/core/event-bus/event-bus.ts:30-36`

Event handler errors are silently swallowed with an empty `catch(() => {})`. Extension lifecycle hooks (onInit/onDestroy) can fail without any indication.

**Fix:** Log errors via `getLogger().error()` at minimum.

---

### 2.5 CLI: Silent Hook Execution Failures

**File:** `packages/cli/src/features/extensions/manager/extension-manager.ts:61-84`

onInit/onDestroy hook execution errors are silently caught. Extensions may appear activated but lack required agent assets (skills, prompts).

**Fix:** Log failures at warn level and surface to user.

---

### 2.6 CLI: Missing stdin.write() Error Handling (MCP)

**File:** `packages/cli/src/features/extensions/mcp/mcp-stdio-transport.ts:114-116`

stdin write return value and errors are ignored. If the write fails, event listeners remain attached (memory leak) and the request hangs.

**Fix:** Check write return value, handle backpressure, and cleanup on error.

---

### 2.7 CLI: Unsafe JSON-RPC Response Casting

**File:** `packages/cli/src/features/extensions/mcp/json-rpc.ts:61`

Double cast `obj as unknown as JsonRpcResponse` bypasses type safety after partial validation.

**Fix:** Use exhaustive type guard or Zod validation.

---

### 2.8 Server: Inconsistent Error Response Format

**Multiple files** — Three different error response patterns are used:
1. `return { error: '...' }` (no status code)
2. `reply.code(400); return { error: '...' }` (code then return)
3. `reply.code(401); void reply.send({ error: '...' })` (void send)

**Fix:** Standardize on a single error response utility function.

---

## 3. MEDIUM Findings

### 3.1 Server: Missing Request Size Limits

No explicit `bodyLimit` configuration. Defaults to Fastify's 1MB, but vault values, settings, and scheduler payloads have no field-level size validation.

### 3.2 Server: Missing Cron Expression Validation

**File:** `packages/server/src/features/scheduler/scheduler.routes.ts:65-78`

Only checks truthy-ness of `body.cron`, not validity. Invalid cron expressions are saved to DB and fail silently at execution time.

### 3.3 Server: Missing Input Length Validation

Vault keys/values, extension names, and scheduler task fields have no maximum length constraints.

### 3.4 CLI: Fire-and-Forget Event Emissions

**File:** `packages/cli/src/core/project/project-manager.ts:66,80`

`void this.bus.emit(...)` suppresses error detection entirely.

### 3.5 CLI: Incomplete Migration Error Recovery

**File:** `packages/cli/src/core/database/database.ts:84-102`

Backup file path is only accessible via error message text, not as a structured property.

### 3.6 CLI: Exponential Backoff Without Max Delay Cap

**File:** `packages/cli/src/features/extensions/mcp/connection-manager.ts:125`

No `Math.min()` cap on backoff delay. Scales badly if MAX_RETRIES increases.

### 3.7 CLI: process.exit() Bypasses Cleanup

**Files:** `cli.ts:498`, `index.ts:11`, `ui.command.ts:153,163`

Direct `process.exit(1)` calls bypass graceful shutdown handlers.

### 3.8 CLI: Missing Extension Name/Version Validation

**File:** `packages/cli/src/features/extensions/manager/extension-manager.ts:87-98`

Extension name/version not validated before DB insert. Malformed names could break path construction.

### 3.9 UI: Missing Error States on Multiple Pages

Pages that silently fail when data fetching errors occur:
- `MarketplacePage.tsx` — No error display for `useMarketplace()` failure
- `VaultPage.tsx` — No error display for `useVaultEntries()` failure
- `ScheduledTasksPage.tsx` — No error display for `useScheduledTasks()` failure
- `GeneralPage.tsx` — No error display for settings fetch failure
- `RegistriesPage.tsx` — No error display for multiple hooks

### 3.10 UI: WebSocket Missing Reconnection Logic

**File:** `packages/ui/src/core/api/websocket.ts:31-60`

No reconnection mechanism or exponential backoff. Connection loss means no live logs until page reload.

### 3.11 UI: Mutation Buttons Not Disabled During Pending State

**File:** `packages/ui/src/features/scheduler/components/TaskRow.tsx:75,81,88`

"Run Now", "History", and "Delete" buttons don't disable during pending mutations, allowing duplicate API calls.

### 3.12 UI: ConfigForm Fires Multiple Independent Mutations

**File:** `packages/ui/src/features/settings/ExtensionSettingsPage.tsx:54-56`

Each config field update fires a separate `updateSettings.mutate()` call instead of batching.

### 3.13 UI: Unsafe Type Assertions in Settings/Logs

Multiple `as` casts without runtime validation:
- `ExtensionSettingsPage.tsx:46-51` — config.schema/values cast
- `LogsPage.tsx:120-124` — settings shape assumed

### 3.14 UI: Accessibility Gaps

- `LogsPage.tsx:82-89` — Role="button" missing `aria-expanded`
- `ConfigForm.tsx:199-202` — Button inside `<p>` is invalid HTML
- `WidgetPicker` — Missing `aria-describedby` on DialogContent (visible in test warnings)

---

## 4. LOW Findings

### 4.1 Configuration Issues

| Issue | Impact |
|-------|--------|
| `create-renre-extension` not in root `tsconfig.json` references | No cross-package type checking |
| `github-mcp` and `atlassian-mcp` missing from `knip.json` | 32 false-positive unused file reports |
| `context7-mcp` missing `config.schema` in manifest | Inconsistent with other MCP extensions |
| 523 files need Prettier formatting (mostly docs) | `pnpm format:check` fails |

### 4.2 UI Build Warning

Vite reports a single chunk of 558KB (above 500KB threshold). Code splitting with dynamic imports would improve initial load time.

### 4.3 Code Duplication

While overall duplication (3.4%) is within threshold, specific areas have higher rates:
- JavaScript: 6.79% (extension dist files)
- TSX: 6.48% (UI component patterns)
- JSON: 9.45% (manifest similarities)

### 4.4 Test Quality Observations

- Component tests across SDK and UI are mostly render-only smoke tests, lacking interaction/behavior tests
- No accessibility assertions in any component tests
- Hook tests lack unmount/cleanup edge case coverage
- Integration tests (tests/*.test.mjs) are minimal (only startup verification)

### 4.5 Inconsistent Error Handling Patterns

The codebase uses three different error handling approaches without a standard policy:
1. `ExtensionError` with error codes (good — used in CLI features)
2. Plain `Error()` throws (inconsistent — used in some utilities)
3. Silent catch and return null/default (risky — used in event bus, hook execution)

---

## 5. Missing Infrastructure

### 5.1 No CI/CD Pipeline

`.github/` exists but only contains `CODEOWNERS`. No GitHub Actions workflows for:
- PR checks (lint, typecheck, test, coverage)
- Release automation
- Dependency vulnerability scanning

### 5.2 No Security Scanning

No dependency audit (`pnpm audit`), no SAST tooling, no secret detection in CI.

### 5.3 No Changelog Automation

`CHANGELOG.md` exists but is manually maintained. No conventional commits enforcement or automated release notes.

---

## 6. Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total packages | 5 | - |
| Total extensions | 6 | - |
| Total source files | ~479 | - |
| Total lines of code | ~32,410 | - |
| Total tests | 1,406 | PASS |
| Test coverage (CLI) | 94.8% | PASS (86% threshold) |
| Test coverage (Server) | 96.1% | PASS |
| Test coverage (SDK) | 98.5% | PASS |
| Test coverage (Scaffold) | 100% | PASS |
| ESLint errors | 0 | PASS |
| TypeScript errors | 0 | PASS |
| Dead code files | 32 | FAIL (all in atlassian-mcp) |
| Code duplication | 3.4% | PASS (5% threshold) |
| Formatting issues | 523 files | FAIL |
| Build time | 18s | OK |

---

## 7. Prioritized Action Plan

### Immediate (Pre-Production Blockers)

1. **Add request validation** to all server route handlers (Zod or Fastify JSON Schema)
2. **Fix CORS** — restrict to known origins
3. **Add path traversal check** for panel/widget asset serving
4. **Add MCP response timeout** (30s default)
5. **Add rate limiting** (`@fastify/rate-limit`) especially on auth endpoints
6. **Validate vault decrypt inputs** before Buffer.from()

### Short-Term (Next Sprint)

7. **Authenticate admin endpoints** regardless of LAN mode
8. **Increase PIN entropy** to 6+ digits with lockout
9. **Log event bus/hook errors** instead of swallowing
10. **Standardize error response format** across server routes
11. **Add error states** to all UI data-fetching pages
12. **Add WebSocket reconnection** with exponential backoff
13. **Set up GitHub Actions CI** (lint, typecheck, test, coverage)

### Medium-Term (Backlog)

14. **Fix Prettier formatting** on 523 files
15. **Configure knip.json** for github-mcp and atlassian-mcp
16. **Add create-renre-extension** to root tsconfig references
17. **Code-split UI bundle** (currently 558KB single chunk)
18. **Batch config mutations** in ExtensionSettingsPage
19. **Add accessibility tests** to component test suites
20. **Add interaction tests** for SDK/UI components
21. **Disable mutation buttons** during pending state
22. **Fix accessibility issues** (aria-expanded, invalid HTML nesting)

---

*Report generated by automated project audit. All findings reference specific file paths and line numbers for actionable remediation.*
