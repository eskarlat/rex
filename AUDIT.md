# RenreKit Full Architecture Audit

**Date:** 2026-03-19
**Scope:** All packages (cli, server, ui, extension-sdk, create-renre-extension), extensions, build infrastructure

---

## Executive Summary

RenreKit is a well-architected microkernel CLI with clean separation of concerns across its 5 packages. The codebase demonstrates strong TypeScript discipline, consistent patterns, and thorough test coverage (123 test files, 86% enforced thresholds). The main areas needing attention are **server-side input validation**, **authentication hardening**, and **missing CI/CD pipeline**.

**Overall Rating: Strong foundation with targeted security gaps.**

---

## 1. Architecture Assessment

### What's Excellent

**Microkernel pattern is well-executed.** The thin core (command registry, event bus, database, paths, logger) stays minimal while extensions provide all domain functionality through three interaction modes (CLI, dashboard panels, SKILL.md files). This is textbook plugin architecture.

**Clean package boundaries:**
- `cli` — all business logic lives here
- `server` — verified zero business logic; pure proxy to CLI managers
- `ui` — clean React SPA, no domain logic
- `extension-sdk` — 3 export subpaths (browser, components, node) with proper isolation
- Build order (`extension-sdk` → `cli` + `ui` → `server`) is correct and enforced by Turborepo

**Config resolution chain** (project override → global → schema defaults) with vault indirection is a strong pattern for managing extension secrets without leaking credentials.

**MCP support** (both stdio and SSE transports) with connection lifecycle management (lazy start, 30s idle timeout, exponential backoff restart) shows mature thinking about extension reliability.

### What's Good

**Event bus** (`packages/cli/src/core/event-bus/event-bus.ts`): Simple, effective pub/sub. Handler errors are properly swallowed to prevent propagation. One concern: `void bus.emit(...)` in extension-manager means events are fire-and-forget — fine for logging/metrics, but if you ever need guaranteed delivery, this pattern won't work.

**Command registry** (`packages/cli/src/core/command-registry/command-registry.ts`): Namespaced command resolution with Levenshtein-based suggestions for typos. Clean and useful. The hand-rolled Levenshtein is fine for small command sets; no need for a library.

**Database layer** (`packages/cli/src/core/database/database.ts`): SQLite with WAL mode, foreign keys enabled, file-based migrations with tracking table. Synchronous API via better-sqlite3 is the right choice for a CLI tool. Migration discovery handles both source and bundled paths.

**Logger** (`packages/cli/src/core/logger/logger.ts`): Pino-based with file rotation (7-day retention), auto-cleanup of old logs. Dual output (file + console) with toggleable console. Solid.

### What Needs Work

**Module-level singletons.** The database (`let db: Database | null = null`) and vault key file are global state accessed via module-level variables. This makes testing harder (must mock at module level) and prevents running multiple CLI instances in the same process. Consider dependency injection.

**Silent error swallowing in extension hooks** (`extension-manager.ts:66-68`):
```typescript
} catch {
  // Hook execution failures are non-fatal during activate/deactivate
}
```
At minimum, log these failures. A broken `onInit` hook could silently leave an extension in a bad state with no diagnostic trail.

**Registry sync is sequential** (`registry-manager.ts:54-65`): `syncAll()` processes registries one at a time with `for...of` + `await`. Should use `Promise.allSettled()` for parallel sync, especially since registries are independent.

---

## 2. CLI Package Deep Dive

### Strengths

- **60+ source files** with clear domain folder structure (core/, features/, shared/)
- **54 test files** — highest test density in the monorepo
- **Two entry points** (`index.ts` for CLI binary, `lib.ts` for server imports) properly separate concerns
- **Extension lifecycle** is well-modeled: install → activate (runs onInit, writes plugins.json) → deactivate (runs onDestroy, removes from plugins.json) → remove
- **Vault encryption** uses AES-256-GCM with proper IV, auth tag, and key file with 0o600 permissions
- **Engine compatibility checking** validates CLI and SDK version constraints from extension manifests
- **Capabilities aggregator** cleanly discovers and merges SKILL.md files from extension directories

### Concerns

**Vault key stored as hex in plaintext file** (`vault-manager.ts:39-43`):
```typescript
const key = crypto.randomBytes(KEY_LENGTH);
fs.writeFileSync(KEY_FILE, key.toString('hex'), { mode: 0o600 });
```
The 0o600 permissions are good, but the key is still a plaintext file. On macOS, consider using the Keychain; on Linux, consider libsecret. For an MVP, this is acceptable but document the threat model.

**Vault reads/writes not atomic** (`vault-manager.ts:94-104`): `readJsonSync` → modify → `writeJsonSync` has a TOCTOU window. Two concurrent vault operations could lose data. Use a file lock or SQLite for the vault store.

**Vault key re-read from disk on every operation** (`vault-manager.ts:36-45`): `deriveKey()` reads the key file on every encrypt/decrypt call. Should cache in memory with proper lifecycle.

**`readPluginsJson` does unchecked JSON.parse** (`extension-manager.ts:37`): If `plugins.json` is corrupted, this throws an unhandled error. Wrap in try-catch with recovery.

**Activate writes plugins.json before hook execution** (`extension-manager.ts:130-139`): If `onInit` hook fails, `plugins.json` already records the extension as active — leaving the project in an inconsistent state. Should write after successful hook.

**`installExtension` does `git clone` with user-provided version tag** (`registry-manager.ts:205`):
```typescript
await git.clone(gitUrl, extDir, ['--branch', `v${version}`, '--depth', '1']);
```
The `version` parameter should be validated to prevent injection of arbitrary git flags (e.g., `--upload-pack`). Validate it matches a semver pattern.

**JSON-RPC error responses not checked** (`connection-manager.ts:99-100`): When MCP response contains an `error` field, `response.result` is undefined but the code returns it without checking. Should throw `ExtensionError` on JSON-RPC errors.

**MCP stdio transport has no buffer size limit** (`mcp-stdio-transport.ts`): A malicious/buggy MCP server sending partial lines indefinitely will grow the buffer without bound. Add a maximum buffer size.

**Silent migration failures** (`database.ts:60`): `runMigrations()` catches all errors without logging. If the migrations directory is missing, failures are silently ignored.

**HOME env fallback creates bad paths** (`registry-manager.ts:24`): `process.env['HOME'] ?? ''` then `path.join('', '.renre-kit')` resolves to `.renre-kit` relative to cwd if HOME is unset.

---

## 3. Server Package

### Strengths

- **Zero business logic verified** — all 32+ endpoints are thin wrappers around CLI managers
- **Structured error handling**: Global error handler maps 24 error codes to HTTP status codes
- **Modular Fastify plugins**: Each feature is a registered plugin, easy to add/remove
- **Graceful shutdown**: Handles SIGINT/SIGTERM, closes server + scheduler
- **WebSocket log streaming** for real-time dashboard updates

### Critical Issues

**1. No input validation at route boundary**
Routes use TypeScript `as` casts without runtime validation:
```typescript
const body = request.body as InstallBody;
```
No schema validation library (Zod, Ajv, Typebox) is used anywhere. This is the single biggest gap. **Add Fastify JSON Schema validation or Typebox.**

**2. PIN authentication is weak** (`lan-auth.ts`):
- 4-digit PIN = 10,000 possible values
- No rate limiting on `/api/auth/pin`
- Bruteforceable in seconds
- **Fix**: 6+ digit PIN, rate limiting (3 attempts/minute), exponential backoff

**3. CORS is wide open**:
```typescript
await fastify.register(cors, { origin: true });
```
Allows requests from ANY origin. Should restrict to `localhost:4201` (the UI) or use an origin whitelist.

**4. Path traversal via X-RenreKit-Project header** (`project-scope.ts:16`):
```typescript
request.projectPath = header; // No path validation
```
No normalization via `path.resolve()` / `path.normalize()`. Attacker could pass `../../etc/passwd`.

**5. No rate limiting anywhere** — all endpoints accept unlimited concurrent requests.

### Moderate Issues

- Scheduler command execution uses `execFileSync` (safe against shell injection) but doesn't validate command existence before execution
- Vault entries returned in full from server; masking happens at UI layer only
- No request logging/audit trail
- No health check endpoint (`/api/health`)
- No API versioning (`/api/v1/...`)
- WebSocket endpoints inherit PIN auth but have no per-connection token

---

## 4. UI Package

### Strengths

- **31 test files** with comprehensive coverage
- **React Query** well-configured: `staleTime: 30s`, `retry: 1`, proper cache invalidation
- **Consistent patterns**: All hooks follow the same structure, all pages use loading skeletons
- **ResourcePage component** (`core/components/ResourcePage.tsx`) eliminates duplication across CRUD pages
- **TypeScript quality is excellent**: No `any` types, proper generics, type narrowing everywhere
- **API client** (`core/api/client.ts`) with proper error handling, 204 support, and header injection
- **WebSocket hooks** with smart protocol detection, message buffering (capped at 1000), graceful cleanup

### Minor Issues

- **Accessibility gaps**: Some buttons missing `aria-label` (e.g., VaultPickerDialog buttons)
- **ConfigForm mutation errors silently dropped**: `updateSettings.mutate()` without `onError` callback
- **ProjectSwitcher potential race**: Calls `setActiveProject()` and `setActive.mutate()` synchronously
- **DynamicPanel uses `@vite-ignore`** for runtime extension panel loading — correct but should be documented

---

## 5. Extension SDK

### Strengths

- **Clean interface design**: `RenreKitSDK` composes 6 capability groups (project, exec, storage, ui, events, scheduler)
- **13 high-level components** for extension authors (Panel, DataTable, CodeBlock, LogViewer, Modal, SearchBar, Split, etc.) — all with tests
- **Shared shadcn/ui primitives** exported via `./components` subpath
- **Agent deployer** (`node/agent-deployer.ts`) handles SKILL.md deployment with subdirectory structure preservation
- **ApiClient** is well-typed with proper error class (`ApiClientError`)
- **React hooks** for extension panels: `useCommand`, `useEvents`, `useExtension`, `useScheduler`, `useStorage`

### Concerns

- **SDK events are client-side only**: `createEventsAPI()` is a local pub/sub; events don't cross extension boundaries via the server. If two extensions need to communicate, they can't.
- **`globalThis.confirm`** used in `sdk.ts:99` for `ui.confirm()` — this won't work in non-browser environments (SSR, testing). Consider making it injectable.
- **No SDK versioning strategy**: The SDK is published but there's no documented compatibility matrix between SDK versions and CLI versions.
- **Missing `tsconfig.build.json`**: Inconsistent with other packages that all have this variant.
- **UI handlers require implicit setup**: Dashboard must call `setToastHandler()` / `setNavigateHandler()` before panels can use toast/navigate. This coupling isn't documented.
- **`ProjectContext.name` nullable before refresh**: Extensions must call `sdk.project.refresh()` before accessing project metadata — implicit requirement.
- **No retry logic in hooks**: `useStorage`, `useCommand`, etc. fail immediately on transient network errors. Extension authors must implement their own retry.
- **DataTable limited**: Converts all non-string values to JSON strings; no custom cell renderer support.
- **No SDK documentation**: No README, getting-started guide, or panel development tutorial exists. Developers must read source code.

### Scaffolding Tool (`create-renre-extension`)

- Two templates (standard + MCP) with proper manifest, tsconfig, entry points, and SKILL.md stubs
- Lifecycle hooks (`onInit`/`onDestroy`) pre-generated in scaffolded code
- Well-tested scaffolding (file creation, manifest structure, engine versions)
- **Gap**: No UI panel scaffolding for standard extensions — authors must manually add panels
- **Gap**: No README generated for scaffolded extensions

### Reference Extensions

- `hello-world` demonstrates multiple panels (command execution, storage, scheduler), vault config hints, and agent asset deployment — good breadth
- `echo-mcp` shows clean JSON-RPC stdio server with tool call handling
- **Missing**: No reference for MCP SSE transport, bidirectional MCP + UI, error recovery patterns, or multi-skill layout

---

## 6. Build Infrastructure & Quality Gates

### Strengths

- **Turborepo** properly configured with dependency-aware task ordering
- **Strict TypeScript**: `noUncheckedIndexedAccess: true`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **ESLint** with `no-explicit-any` as error, cyclomatic complexity max 10, cognitive complexity max 15
- **86% coverage thresholds** enforced per-package via Istanbul
- **jscpd** with threshold 5 for duplication detection
- **Prettier** consistently configured (100 char, single quotes, trailing commas, 2-space indent)
- **27 ADRs** documenting architectural decisions
- **Comprehensive architecture spec** in `renre-kit-architecture/README.md`

### Issues

**No CI/CD pipeline.** No GitHub Actions workflows found. All quality gates require manual `pnpm validate` execution. This is the most impactful missing piece for team collaboration.

**Vitest config inconsistency**: `packages/cli/vitest.config.ts` is missing `passWithNoTests: true` (present in 4 of 5 other packages).

**Lint script inconsistency**: CLI uses `--ignore-pattern '**/*.test.ts'` while others rely on ESLint config's ignorePatterns.

---

## 7. Reference Extensions

`hello-world` (standard type) and `echo-mcp` (MCP stdio) are minimal but sufficient as examples. Both follow the `tsc && node build-panel.js` build pattern using the SDK's `buildPanel`.

**Missing**: A reference extension demonstrating MCP SSE transport, vault integration, scheduled tasks, or multi-skill layout. The existing examples only cover the simplest scenarios.

---

## 8. Summary: Top Priorities

### Must Fix (Security/Correctness)

| # | Issue | Location | Effort |
|---|-------|----------|--------|
| 1 | Add request body schema validation | `packages/server/src/features/*/` | Medium |
| 2 | Strengthen PIN auth (6+ digits, rate limiting) | `packages/server/src/core/middleware/lan-auth.ts` | Small |
| 3 | Restrict CORS to localhost/whitelist | `packages/server/src/server.ts` | Small |
| 4 | Validate/normalize project path header | `packages/server/src/core/middleware/project-scope.ts` | Small |
| 5 | Validate git clone version parameter | `packages/cli/src/features/registry/registry-manager.ts` | Small |
| 6 | Handle JSON-RPC error responses in connection manager | `packages/cli/src/features/extensions/mcp/connection-manager.ts` | Small |

### Should Fix (Reliability/DX)

| # | Issue | Location | Effort |
|---|-------|----------|--------|
| 7 | Add CI/CD pipeline (GitHub Actions) | `.github/workflows/` | Medium |
| 8 | Log extension hook failures instead of swallowing | `packages/cli/src/features/extensions/manager/extension-manager.ts` | Small |
| 9 | Fix activate: write plugins.json after hook, not before | `packages/cli/src/features/extensions/manager/extension-manager.ts` | Small |
| 10 | Make vault writes atomic (file lock or SQLite) | `packages/cli/src/features/vault/vault-manager.ts` | Medium |
| 11 | Add buffer size limit to MCP stdio transport | `packages/cli/src/features/extensions/mcp/mcp-stdio-transport.ts` | Small |
| 12 | Cache vault key in memory instead of re-reading from disk | `packages/cli/src/features/vault/vault-manager.ts` | Small |
| 13 | Parallelize registry sync with Promise.allSettled | `packages/cli/src/features/registry/registry-manager.ts` | Small |
| 14 | Log migration failures in database init | `packages/cli/src/core/database/database.ts` | Small |
| 15 | Add health check endpoint | `packages/server/` | Small |

### Nice to Have (Polish)

| # | Issue | Location | Effort |
|---|-------|----------|--------|
| 16 | API versioning (`/api/v1/`) | `packages/server/` | Medium |
| 17 | Request audit logging | `packages/server/` | Small |
| 18 | Add SDK documentation (README, panel dev guide) | `packages/extension-sdk/` | Medium |
| 19 | Add more reference extensions (SSE, multi-skill) | `extensions/` | Medium |
| 20 | SDK version compatibility matrix | `packages/extension-sdk/` | Small |
| 15 | Accessibility improvements (ARIA labels) | `packages/ui/` | Small |

---

## 9. What's Done Well (Keep Doing This)

1. **Strict TypeScript everywhere** — `noUncheckedIndexedAccess`, no `any`, proper generics
2. **Co-located tests** — 123 test files, 86% enforced coverage
3. **Clean package boundaries** — server has zero business logic, UI has zero domain logic
4. **Architecture documentation** — 27 ADRs, comprehensive spec, database diagrams
5. **Consistent patterns** — every package follows the same core/features/shared structure
6. **Quality gates** — lint, typecheck, coverage, duplication all enforced
7. **Extension SDK DX** — good component library, typed hooks, clean API client
8. **MCP connection management** — lazy start, idle timeout, exponential backoff restart
9. **Config resolution chain** — project → global → defaults with vault indirection
10. **Vault encryption** — AES-256-GCM with auth tags, proper key file permissions
