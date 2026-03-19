# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

**RenreKit CLI** — a lightweight, plugin-driven development CLI following a **Microkernel (Plugin Architecture)** pattern. A thin core handles discovery, loading, and routing while **extensions** provide all domain-specific functionality through three interaction modes: CLI commands, web dashboard UI panels, and LLM skill definitions (SKILL.md files).

## Build & Development Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages (tsup, respects dependency order via Turborepo)
pnpm dev                  # Watch mode for all packages in parallel
pnpm test                 # Run all Vitest tests
pnpm test:coverage        # Run tests with 86% coverage enforcement (Istanbul)
pnpm lint                 # ESLint across all packages
pnpm lint:duplication     # jscpd duplication detection (threshold 5)
pnpm typecheck            # tsc --noEmit across all packages
pnpm format               # Prettier format all files
pnpm format:check         # Check formatting without writing
pnpm validate             # Run ALL quality gates (lint + typecheck + coverage + duplication)
```

### Per-package commands (run from package directory or with `--filter`):

```bash
pnpm --filter @renre-kit/cli test                    # Test only CLI package
pnpm --filter @renre-kit/cli test -- src/core/database/database.test.ts  # Single test file
pnpm --filter @renre-kit/ui dev                      # UI dev server with HMR (port 4201, proxies /api to 4200)
pnpm --filter @renre-kit/server dev                  # Server dev with tsx watch (port 4200)
```

## Monorepo Structure

Turborepo + pnpm workspaces. Build order: `extension-sdk` first (no deps), then `cli` and `ui` (both depend on extension-sdk, can build in parallel), then `server` (depends on cli).

| Package | Path | Build | Purpose |
|---------|------|-------|---------|
| **extension-sdk** | `packages/extension-sdk/` | tsup | SDK for extension authors: API client, hooks, shared shadcn/ui components |
| **cli** | `packages/cli/` | tsup | Core CLI: project lifecycle, extensions, registry, commands |
| **server** | `packages/server/` | tsup, tsx watch (dev) | Dashboard REST API (pure proxy to CLI managers, zero business logic) |
| **ui** | `packages/ui/` | Vite | Web dashboard SPA (React 19, Tailwind, shadcn/ui, React Query) |
| **create-renre-extension** | `packages/create-renre-extension/` | tsup | Scaffolding tool for generating new extensions |

## Code Architecture

### Domain Folder Structure (all packages follow this pattern)

```
src/
  core/         # Infrastructure: database, event-bus, logger, paths, types, command-registry
  features/     # Domain modules: extensions/, registry/, vault/, config/, skills/, project/
  shared/       # Cross-cutting utilities: fs-helpers, platform, interpolation
```

### CLI Package (`packages/cli/`) — the heart of the system

- **Two entry points**: `index.ts` (CLI binary — auto-runs Commander program) and `lib.ts` (library — exports managers for server package to import via `@renre-kit/cli/lib`)
- **Command flow**: User input → Commander.js parser → Command Registry (namespaced lookup) → Handler executes with `ExecutionContext` → Output
- **Extension types**: Standard (in-process `require()`), MCP stdio (child process JSON-RPC), MCP SSE (HTTP)
- **Connection Manager**: Manages MCP server lifecycle — lazy start, 30s idle timeout, exponential backoff restart (max 3 retries)
- **Database**: SQLite via better-sqlite3 (synchronous API). 4 tables: `projects`, `installed_extensions`, `scheduled_tasks`, `task_history`. Migration files in `migrations/001-initial-schema.sql`.
- **Extension lifecycle**: Extensions export `onInit`/`onDestroy` named exports from their `main` entry point to deploy/remove SKILL.md and agent assets. Core imports the module and calls these exports — extensions do the file copying.
- **Config resolution chain**: project override (`.renre-kit/manifest.json`) → global (`~/.renre-kit/config.json`) → schema defaults. Vault-mapped fields get decrypted via indirection.

### Server Package — zero business logic

Every dashboard action imports CLI managers through `@renre-kit/cli/lib` and calls them directly. All requests scoped by `X-RenreKit-Project` header. Routes are thin wrappers around ProjectManager, ExtensionManager, VaultManager, etc.

### Reference Extensions

`extensions/` at repo root contains two example extensions for testing and reference:
- **hello-world** — Standard type (in-process). Has agent assets (`agent/context/`, `agent/prompts/`), skills (`skills/greet/`, `skills/info/`), and a `SKILL.md`.
- **echo-mcp** — MCP stdio type. Minimal MCP server in `src/server.ts` with manifest and `SKILL.md`.

### Global vs Per-Project State

- **Global** (`~/.renre-kit/`): `db.sqlite`, `extensions/{name}@{version}/`, `registries/{name}/`, `vault.json`, `config.json`, `logs/`
- **Per-project** (`.renre-kit/`): `manifest.json`, `plugins.json` (exact version pins), `storage/`
- **LLM assets** (`.agents/`): `skills/{name}/SKILL.md`, `prompts/`, `agents/`, `workflows/`, `context/`

## Testing

Vitest with Istanbul coverage. Tests are co-located (`*.test.ts` next to source). Environments differ per package:
- **cli, server**: `environment: 'node'`
- **ui, extension-sdk**: `environment: 'jsdom'` with setup files (`src/test-setup.ts`)

Coverage excludes: test files, type-only modules, entry points (`index.ts`, `main.tsx`), and vendored shadcn/ui components.

## Quality Enforcement

These are hard requirements, not suggestions:

- **No `any` types**: `@typescript-eslint/no-explicit-any` is an error. Use `unknown` + type narrowing.
- **Complexity limits**: Cyclomatic max 10 (`complexity`), Cognitive max 15 (`sonarjs/cognitive-complexity`). Refactor if hit.
- **Test coverage**: 86% minimum (statements, branches, functions, lines) enforced per-package via Istanbul thresholds.
- **Duplication**: jscpd with threshold 5. Extract shared logic rather than copying.
- **All lint warnings must be addressed** — never skip or suppress without justification.
- **TDD**: Write tests first (`*.test.ts` co-located with source), then implementation.
- **ESLint config**: `.eslintrc.cjs` at `packages/` level. Overrides relax `no-unsafe-*` rules for shadcn/ui components and React generic-heavy code.

## TypeScript Conventions

- ESM throughout: use `.js` extension in imports (e.g., `import { x } from './foo.js'`)
- `import type` for type-only imports
- CLI/server packages use `NodeNext` module resolution; UI/SDK packages use `Bundler`
- `noUncheckedIndexedAccess: true` — always handle potential `undefined` from indexing
- Each package has `tsconfig.json` (base), `tsconfig.build.json` (build), and `tsconfig.lint.json` (lint) variants

## Architecture Documentation

The full architecture spec lives in `renre-kit-architecture/README.md` (14 sections, source of truth). ADRs in `renre-kit-architecture/adr/` (23 decisions across core, extensions, vault, dashboard, sdk, llm-skills, scheduler, security). Database ER diagram in `renre-kit-architecture/diagrams/database-schema.md`. Data flow diagrams in `renre-kit-architecture/diagrams/dfd-overview.md`.

## MVP Phases

1. **Core CLI & Extensions** — Project lifecycle, extension management, command registry, MCP support, git registry, SQLite DB
2. **Vault, Configuration & Versioning** — AES-256-GCM encrypted vault, config schema with vault mapping, version pinning/updates
3. **Web Dashboard** — Fastify server (32 REST endpoints), React UI with shadcn/ui, marketplace, settings, LAN access with PIN auth, scheduler
4. **Extension SDK & Ecosystem** — Published SDK package, scaffolding tool (`create-renre-extension`), reference extensions, SKILL.md convention
