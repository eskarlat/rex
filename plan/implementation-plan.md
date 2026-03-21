# RenreKit CLI — Full Implementation Plan

## Context

This is a greenfield implementation of **RenreKit CLI**, a lightweight plugin-driven development CLI following a Microkernel (Plugin Architecture) pattern. The architecture is fully specified in `renre-kit-architecture/README.md` (14 sections), 23 ADRs, database schema, and data flow diagrams. No source code exists yet — only documentation.

The goal is to implement the entire system across 4 phases, matching the architecture spec 100%, using a team of parallel agents.

### Development Methodology: TDD (Test-Driven Development)

Every module is implemented test-first:

1. Write failing tests that define the expected behavior
2. Write minimal code to make tests pass
3. Refactor while keeping tests green

### Quality Gates (enforced after EVERY phase)

After each phase completes, a **Phase Gate Validation** must pass before moving on:

1. **Plan vs. Implementation Check** — 100% of planned items implemented. If gaps found, fill them before proceeding.
2. **Lint Check** — ESLint with:
   - `complexity: ["warn", { max: 10 }]` — max 10 cyclomatic branches per function
   - `sonarjs/cognitive-complexity: ["warn", 15]` — max 15 cognitive complexity
   - **All warnings must be addressed. No skipping.**
3. **Duplication Check** — `jscpd --config .jscpd.json` — no significant code duplication
4. **TypeScript Strict** — `tsc --noEmit` with strict mode. **No `any` types.** All values fully typed.
5. **Test Coverage** — **86% minimum** across all packages (statements, branches, functions, lines)
6. **Build Check** — `turbo build` succeeds with zero errors

---

## Phase 0: Monorepo Bootstrap

**Creates the foundation all packages depend on.**

### Files to Create

```
package.json                    # pnpm workspace root
pnpm-workspace.yaml             # packages: ["packages/*"]
turbo.json                      # build/dev/test/lint/typecheck/validate pipelines
tsconfig.base.json              # shared: strict, ES2022, NodeNext, declaration, noUncheckedIndexedAccess
tsconfig.json                   # project references to all packages
.eslintrc.cjs                   # typescript-eslint + sonarjs plugin
.prettierrc                     # consistent formatting
.jscpd.json                     # duplication detection config
.gitignore                      # node_modules, dist, .turbo, *.sqlite
.node-version                   # Node 20
vitest.workspace.ts             # shared vitest workspace
```

### ESLint Config (`.eslintrc.cjs`)

```js
// Key rules:
"complexity": ["warn", { max: 10 }],
"sonarjs/cognitive-complexity": ["warn", 15],
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/no-unsafe-assignment": "error",
// Plugins: @typescript-eslint, eslint-plugin-sonarjs
```

### jscpd Config (`.jscpd.json`)

```json
{
  "threshold": 5,
  "reporters": ["console"],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/*.test.ts"],
  "absolute": true
}
```

### Turborepo Pipeline

- `build`: depends on `^build`, outputs `dist/**`
- `dev`: cache false, persistent true
- `test`: depends on `build`
- `test:coverage`: depends on `build` (runs vitest with --coverage, threshold 86%)
- `lint`: no deps
- `lint:duplication`: `jscpd --config .jscpd.json`
- `typecheck`: depends on `^build`
- `validate`: depends on `lint`, `typecheck`, `test:coverage`, `lint:duplication` (phase gate)

### Build Order (dependency graph)

1. `packages/extension-sdk` — no internal deps (builds first)
2. `packages/cli` — depends on extension-sdk types
3. `packages/server` — depends on cli (imports managers)
4. `packages/ui` — depends on extension-sdk (shared components)

---

## Phase 1: Core CLI & Extensions

**The largest phase. Establishes CLI core, extension system, database, command registry.**

### Package: `packages/cli/` — Domain Folder Structure

**Dependencies:** commander, @clack/prompts, better-sqlite3, fs-extra, simple-git, zod
**Dev:** @types/better-sqlite3, @types/fs-extra, typescript, vitest, tsup, eslint-plugin-sonarjs

```
packages/cli/
  package.json
  tsconfig.json
  vitest.config.ts
  bin/renre-kit.js                            # #!/usr/bin/env node ESM wrapper
  migrations/
    001-initial-schema.sql                    # 4 tables
  src/
    index.ts                                  # CLI entry point
    cli.ts                                    # Commander program setup

    # ── CORE DOMAIN ──────────────────────────
    core/
      types/
        index.ts                              # Re-exports all core types
        project.types.ts                      # ProjectRecord, ProjectManifest, PluginsJson
        config.types.ts                       # GlobalConfig, RegistryConfig, ConfigMapping
        events.types.ts                       # EventType enum, EventPayload union
        context.types.ts                      # ExecutionContext interface
        errors.types.ts                       # Error code enums
      paths/
        paths.ts                              # All path constants (global + per-project + agent)
        paths.test.ts
      database/
        database.ts                           # better-sqlite3 singleton, migration runner
        database.test.ts
      project/
        project-manager.ts                    # init, destroy, list, get, detect, updateLastAccessed
        project-manager.test.ts
      logger/
        logger.ts                             # Rotating daily logs, 4 levels, 7-day retention
        logger.test.ts
      event-bus/
        event-bus.ts                          # on, off, emit (typed pub/sub, async-safe)
        event-bus.test.ts
      command-registry/
        command-registry.ts                   # register, resolve, list, suggest (fuzzy match)
        command-registry.test.ts
      errors/
        extension-error.ts                    # ExtensionError class
        extension-error.test.ts

    # ── EXTENSIONS DOMAIN ────────────────────
    features/extensions/
      types/
        index.ts                              # Re-exports extension types
        extension.types.ts                    # ExtensionManifest, ExtensionType, ExtensionCommand
        mcp.types.ts                          # McpTransport, McpConfig, JsonRpcRequest/Response
      manifest/
        manifest-loader.ts                    # Parse + validate manifest.json with Zod
        manifest-loader.test.ts
      runtime/
        standard-runtime.ts                   # require() + execute for standard extensions
        standard-runtime.test.ts
      mcp/
        connection-manager.ts                 # MCP lifecycle: lazy start, idle timeout, restart w/ backoff
        connection-manager.test.ts
        mcp-stdio-transport.ts                # Child process spawn, stdin/stdout JSON-RPC pipes
        mcp-stdio-transport.test.ts
        mcp-sse-transport.ts                  # HTTP SSE client, reconnection, 30s timeout
        mcp-sse-transport.test.ts
        json-rpc.ts                           # JSON-RPC 2.0 message builder/parser
        json-rpc.test.ts
      manager/
        extension-manager.ts                  # install, remove, list, activate, deactivate, getActivated, status
        extension-manager.test.ts
      commands/
        ext-add.command.ts                    # renre-kit ext:add
        ext-add.command.test.ts
        ext-remove.command.ts                 # renre-kit ext:remove
        ext-remove.command.test.ts
        ext-list.command.ts                   # renre-kit ext:list
        ext-list.command.test.ts
        ext-activate.command.ts               # renre-kit ext:activate (runs extension onInit hook)
        ext-activate.command.test.ts
        ext-deactivate.command.ts             # renre-kit ext:deactivate (runs extension onDestroy hook)
        ext-deactivate.command.test.ts
        ext-config.command.ts                 # Stub (Phase 2)
        ext-status.command.ts                 # renre-kit ext:status
        ext-status.command.test.ts
        ext-restart.command.ts                # renre-kit ext:restart
        ext-restart.command.test.ts

    # ── REGISTRY DOMAIN ──────────────────────
    features/registry/
      registry-manager.ts                     # clone, pull, list, sync, resolve, installExtension
      registry-manager.test.ts
      registry-cache.ts                       # cacheTTL, .fetched_at, stale detection
      registry-cache.test.ts
      commands/
        registry-sync.command.ts              # renre-kit registry:sync
        registry-sync.command.test.ts
        registry-list.command.ts              # renre-kit registry:list
        registry-list.command.test.ts

    # ── SKILLS DOMAIN ────────────────────────
    features/skills/
      capabilities-aggregator.ts              # Concatenate all active SKILL.md files
      capabilities-aggregator.test.ts
      commands/
        capabilities.command.ts               # renre-kit capabilities
        capabilities.command.test.ts

    # ── PROJECT COMMANDS ─────────────────────
    features/project/
      commands/
        init.command.ts                       # renre-kit init
        init.command.test.ts
        destroy.command.ts                    # renre-kit destroy
        destroy.command.test.ts

    # ── SHARED UTILITIES ─────────────────────
    shared/
      fs-helpers.ts                           # ensureDir, readJson, writeJson, copyDir, removeDir (sync)
      fs-helpers.test.ts
      platform.ts                             # OS detection, hardware UUID/MAC
      platform.test.ts
      interpolation.ts                        # ${config.*} template interpolation
      interpolation.test.ts
```

### Skill/Agent Asset Deployment via Extension Hooks

**Important:** The CLI core does NOT have a standalone `skill-deployer.ts`. Per the architecture, each extension uses its **lifecycle hooks** (`onInit`, `onDestroy`) to copy/remove files from the project:

- **onInit hook:** Extension copies `skills/SKILL.md` to `.agents/skills/{extensionName}/SKILL.md`, and copies `agent/` subdirectories (prompts, agents, workflows, context) to `.agents/{type}/{extensionName}/`
- **onDestroy hook:** Extension removes its files from `.agents/`

The `ext:activate` command triggers the extension's `onInit` hook. The `ext:deactivate` command triggers the `onDestroy` hook. The core provides utility functions in `shared/fs-helpers.ts` that hooks can use, but the deployment logic lives in the extension hooks themselves.

The `capabilities` command scans `.agents/skills/*/SKILL.md` and concatenates them — it reads what hooks have already deployed.

### Task Breakdown (Phase 1) — TDD Order

Each task: write tests first, then implementation.

| Task | File(s)                                                    | Depends On          | Stream      |
| ---- | ---------------------------------------------------------- | ------------------- | ----------- |
| 1.1  | `core/paths/` + tests                                      | —                   | A           |
| 1.2  | `core/types/*`, `features/extensions/types/*`              | —                   | A           |
| 1.3  | `shared/fs-helpers.ts` + tests                             | —                   | A           |
| 1.4  | `core/logger/` + tests                                     | 1.1                 | A           |
| 1.5  | `core/database/` + `migrations/` + tests                   | 1.1, 1.2            | A           |
| 1.6  | `core/event-bus/` + tests                                  | 1.2, 1.4            | A           |
| 1.7  | `core/errors/` + tests                                     | 1.2                 | A           |
| 1.8  | `features/extensions/manifest/` + tests                    | 1.2, 1.3            | B           |
| 1.9  | `features/extensions/runtime/` + tests                     | 1.2                 | B           |
| 1.10 | `features/extensions/mcp/json-rpc.ts` + tests              | 1.2                 | B           |
| 1.11 | `features/extensions/mcp/mcp-stdio-transport.ts` + tests   | 1.10                | B           |
| 1.12 | `features/extensions/mcp/mcp-sse-transport.ts` + tests     | 1.10                | B           |
| 1.13 | `features/extensions/mcp/connection-manager.ts` + tests    | 1.11, 1.12, 1.4     | B           |
| 1.14 | `shared/interpolation.ts` + tests                          | —                   | B           |
| 1.15 | `features/skills/capabilities-aggregator.ts` + tests       | 1.1, 1.3            | C           |
| 1.16 | `features/registry/registry-cache.ts` + tests              | 1.1, 1.3            | C           |
| 1.17 | `features/registry/registry-manager.ts` + tests            | 1.1, 1.3, 1.4, 1.16 | C           |
| 1.18 | `core/project/project-manager.ts` + tests                  | 1.5, 1.6, 1.3, 1.1  | A           |
| 1.19 | `features/extensions/manager/extension-manager.ts` + tests | 1.5, 1.6, 1.3, 1.8  | A+B         |
| 1.20 | `core/command-registry/` + tests                           | 1.2, 1.8, 1.4       | A           |
| 1.21 | All `commands/*.command.ts` + tests, `cli.ts`, `index.ts`  | ALL above           | Integration |

### Database Schema (001-initial-schema.sql)

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT UNIQUE,
  created_at TEXT NOT NULL,
  last_accessed_at TEXT NOT NULL
);

CREATE TABLE installed_extensions (
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  registry_source TEXT,
  installed_at TEXT NOT NULL,
  type TEXT NOT NULL,
  PRIMARY KEY (name, version)
);

CREATE TABLE scheduled_tasks (
  id TEXT PRIMARY KEY,
  extension_name TEXT NOT NULL,
  project_path TEXT,
  cron TEXT NOT NULL,
  command TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_run_at TEXT,
  last_status TEXT,
  next_run_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE task_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  duration_ms INTEGER,
  status TEXT NOT NULL,
  output TEXT
);

CREATE INDEX idx_task_history_task_id ON task_history(task_id);
```

### Team Assignment (Phase 1)

- **Agent A (Core):** Tasks 1.1-1.7, 1.18, 1.20
- **Agent B (Extensions):** Tasks 1.8-1.14
- **Agent C (Registry + Skills + Integration):** Tasks 1.15-1.17, then 1.21
- Task 1.19 bridges A+B

### Phase 1 Gate Validation

- [ ] `pnpm turbo typecheck` — zero errors, no `any` types
- [ ] `pnpm turbo lint` — zero warnings (complexity <= 10, cognitive <= 15)
- [ ] `pnpm turbo lint:duplication` — jscpd passes
- [ ] `pnpm turbo test:coverage` — >= 86%
- [ ] Plan checklist: every command, every manager method, every type implemented

---

## Phase 2: Vault, Configuration & Versioning

### New Files in `packages/cli/` — Domain Structure

```
src/
  # ── VAULT DOMAIN ───────────────────────
  features/vault/
    types/
      vault.types.ts                          # VaultEntry, VaultOptions
    crypto/
      vault-crypto.ts                         # AES-256-GCM encrypt/decrypt (Node crypto)
      vault-crypto.test.ts
      key-derivation.ts                       # Machine-specific key via PBKDF2(hardware UUID)
      key-derivation.test.ts
    manager/
      vault-manager.ts                        # CRUD: get, set, list, remove, getByTags
      vault-manager.test.ts
    commands/
      vault-set.command.ts                    # renre-kit vault:set (--secret for masked input)
      vault-set.command.test.ts
      vault-list.command.ts                   # renre-kit vault:list (secrets masked)
      vault-list.command.test.ts
      vault-remove.command.ts                 # renre-kit vault:remove (warn if referenced)
      vault-remove.command.test.ts

  # ── CONFIG DOMAIN ──────────────────────
  features/config/
    types/
      config-resolution.types.ts              # ResolvedConfig, ConfigSource
    resolver/
      config-resolver.ts                      # Resolution chain: project -> global -> defaults + vault deref
      config-resolver.test.ts
    matcher/
      vault-matcher.ts                        # Smart matching: vaultHint + tags scoring
      vault-matcher.test.ts
    manager/
      config-manager.ts                       # Global + per-project config read/write
      config-manager.test.ts
    validator/
      schema-validator.ts                     # Validate config against config.schema
      schema-validator.test.ts
    commands/
      ext-config.command.ts                   # REPLACE stub: interactive config setup
      ext-config.command.test.ts

  # ── VERSIONING (added to extensions domain) ──
  features/extensions/commands/
    ext-outdated.command.ts                   # renre-kit ext:outdated
    ext-outdated.command.test.ts
    ext-update.command.ts                     # renre-kit ext:update
    ext-update.command.test.ts
    ext-cleanup.command.ts                    # renre-kit ext:cleanup (GC versions)
    ext-cleanup.command.test.ts
```

### Task Breakdown (Phase 2) — TDD Order

| Task | File(s)                                                         | Depends On   | Stream |
| ---- | --------------------------------------------------------------- | ------------ | ------ |
| 2.1  | `vault/crypto/key-derivation.ts` + tests                        | Phase 1      | A      |
| 2.2  | `vault/crypto/vault-crypto.ts` + tests                          | 2.1          | A      |
| 2.3  | `vault/manager/vault-manager.ts` + tests                        | 2.2          | A      |
| 2.4  | `vault/commands/*` + tests                                      | 2.3          | A      |
| 2.5  | `config/resolver/config-resolver.ts` + tests                    | 2.3, Phase 1 | B      |
| 2.6  | `config/matcher/vault-matcher.ts` + tests                       | 2.3          | B      |
| 2.7  | `config/manager/config-manager.ts` + tests                      | 2.5          | B      |
| 2.8  | `config/commands/ext-config.command.ts` + tests                 | 2.6, 2.7     | B      |
| 2.9  | `extensions/commands/ext-outdated,update,cleanup` + tests       | Phase 1      | C      |
| 2.10 | Update `connection-manager.ts` for config interpolation + tests | 2.5          | C      |

### Team Assignment (Phase 2)

- **Agent A:** Tasks 2.1-2.4 (vault subsystem)
- **Agent B:** Tasks 2.5-2.8 (config resolution)
- **Agent C:** Tasks 2.9-2.10 (versioning + interpolation)

### Phase 2 Gate Validation

- [ ] `pnpm turbo typecheck` — zero errors, no `any`
- [ ] `pnpm turbo lint` — zero warnings
- [ ] `pnpm turbo lint:duplication` — jscpd passes
- [ ] `pnpm turbo test:coverage` — >= 86%
- [ ] Plan checklist: vault CRUD, config resolution chain, all versioning commands

---

## Phase 3: Web Dashboard

### Package: `packages/server/` — Domain Structure

**Dependencies:** fastify, @fastify/cors, @fastify/static, @fastify/websocket, @fastify/cookie, cron-parser
**Internal dep:** @renre-kit/cli (workspace:\*)

```
packages/server/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts                                  # Server entry point
    server.ts                                 # Fastify instance, plugin registration

    # ── CORE ─────────────────────────────────
    core/
      middleware/
        project-scope.ts                      # Extract X-RenreKit-Project header
        project-scope.test.ts
        lan-auth.ts                           # PIN-based auth for LAN mode
        lan-auth.test.ts
        error-handler.ts                      # Global error -> JSON response
        error-handler.test.ts
      utils/
        sleep-prevention.ts                   # macOS: caffeinate, Linux: systemd-inhibit
        sleep-prevention.test.ts
        pin-generator.ts                      # Random 4-digit PIN
        pin-generator.test.ts

    # ── FEATURES (one folder per API domain) ─
    features/
      projects/
        projects.routes.ts                    # GET /api/projects, PUT /active, GET /api/project
        projects.routes.test.ts
      extensions/
        extensions.routes.ts                  # GET /api/marketplace, POST install/activate/deactivate, DELETE
        extensions.routes.test.ts
      commands/
        commands.routes.ts                    # POST /api/run
        commands.routes.test.ts
      settings/
        settings.routes.ts                    # GET/PUT /api/settings, GET/PUT extensions/:name
        settings.routes.test.ts
      vault/
        vault.routes.ts                       # GET/POST /api/vault, PUT/DELETE /api/vault/:key
        vault.routes.test.ts
      registries/
        registries.routes.ts                  # GET/POST /api/registries, DELETE, POST sync
        registries.routes.test.ts
      scheduler/
        scheduler.routes.ts                   # GET/POST/PUT/DELETE /api/scheduler, trigger, history
        scheduler.routes.test.ts
        scheduler-runner.ts                   # 60s tick loop, execute due tasks
        scheduler-runner.test.ts
      logs/
        logs.websocket.ts                     # WS /api/logs — real-time streaming
        logs.websocket.test.ts
```

### Package: `packages/ui/` — Domain Structure with shadcn/ui

**Dependencies:** react 19, react-dom, react-router-dom, @tanstack/react-query, lucide-react, clsx, tailwind-merge, class-variance-authority
**Dev:** vite, @vitejs/plugin-react, tailwindcss 4, postcss, autoprefixer
**UI Components:** shadcn/ui (Radix + Tailwind) — initialized via `npx shadcn@latest init`

```
packages/ui/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  postcss.config.js
  tailwind.config.ts
  components.json                             # shadcn/ui config

  src/
    main.tsx                                  # React app entry + router
    App.tsx                                   # Root layout

    # ── CORE ─────────────────────────────────
    core/
      api/
        client.ts                             # HTTP client with X-RenreKit-Project header
        websocket.ts                          # WS client for log streaming
      hooks/
        use-projects.ts                       # React Query hooks for projects API
        use-extensions.ts                     # React Query hooks for extensions API
        use-vault.ts                          # React Query hooks for vault API
        use-registries.ts                     # React Query hooks for registries API
        use-scheduler.ts                      # React Query hooks for scheduler API
        use-settings.ts                       # React Query hooks for settings API
      layouts/
        DashboardLayout.tsx                   # Sidebar + content
        SettingsLayout.tsx                    # Settings sub-sidebar
      providers/
        QueryProvider.tsx                     # React Query provider
        ProjectProvider.tsx                   # Active project context

    # ── SHARED (shadcn/ui components) ────────
    components/
      ui/                                     # shadcn/ui generated components
        button.tsx                            # shadcn Button
        input.tsx                             # shadcn Input
        select.tsx                            # shadcn Select
        dialog.tsx                            # shadcn Dialog (for modals)
        table.tsx                             # shadcn Table
        badge.tsx                             # shadcn Badge
        card.tsx                              # shadcn Card
        tabs.tsx                              # shadcn Tabs
        toast.tsx                             # shadcn Toast
        form.tsx                              # shadcn Form (react-hook-form + zod)
        checkbox.tsx                          # shadcn Checkbox
        dropdown-menu.tsx                     # shadcn DropdownMenu
        alert.tsx                             # shadcn Alert
        separator.tsx                         # shadcn Separator
        scroll-area.tsx                       # shadcn ScrollArea
        switch.tsx                            # shadcn Switch
        skeleton.tsx                          # shadcn Skeleton
        tooltip.tsx                           # shadcn Tooltip

    # ── FEATURES (one folder per page/domain) ─
    features/
      home/
        HomePage.tsx                          # Project overview, active extensions
        HomePage.test.tsx
      marketplace/
        MarketplacePage.tsx                   # Active/Installed/Available sections
        MarketplacePage.test.tsx
        components/
          ExtensionCard.tsx                   # Card for extension display
          ExtensionCard.test.tsx
      vault/
        VaultPage.tsx                         # Vault CRUD
        VaultPage.test.tsx
      scheduler/
        ScheduledTasksPage.tsx                # Task list, trigger, history
        ScheduledTasksPage.test.tsx
        components/
          TaskRow.tsx                         # Task list row
          TaskRow.test.tsx
          HistoryModal.tsx                    # Execution history modal
          HistoryModal.test.tsx
      extensions/
        ExtensionPanelPage.tsx                # Dynamic loader for extension UI
        ExtensionPanelPage.test.tsx
        components/
          DynamicPanel.tsx                    # Error boundary + dynamic import()
          DynamicPanel.test.tsx
      settings/
        GeneralPage.tsx                       # Port, theme, log level
        GeneralPage.test.tsx
        RegistriesPage.tsx                    # Registry CRUD
        RegistriesPage.test.tsx
        VaultSettingsPage.tsx                 # Vault management
        VaultSettingsPage.test.tsx
        ExtensionSettingsPage.tsx             # Auto-generated form from config.schema
        ExtensionSettingsPage.test.tsx
        components/
          ConfigForm.tsx                      # Auto-generated form from JSON schema
          ConfigForm.test.tsx
      navigation/
        Sidebar.tsx                           # Main nav sidebar
        Sidebar.test.tsx
        ProjectSwitcher.tsx                   # Project dropdown
        ProjectSwitcher.test.tsx
      auth/
        PinPrompt.tsx                         # PIN entry for LAN
        PinPrompt.test.tsx

    # ── STYLES ───────────────────────────────
    styles/
      globals.css                             # Tailwind base + design tokens
      tokens.css                              # CSS custom properties for theming
    lib/
      utils.ts                                # cn() helper (clsx + tailwind-merge)
```

### REST API (32 endpoints)

| Method | Endpoint                       | Handler                                            |
| ------ | ------------------------------ | -------------------------------------------------- |
| GET    | /api/projects                  | projectManager.list()                              |
| PUT    | /api/projects/active           | set active project                                 |
| GET    | /api/project                   | projectManager.get(active)                         |
| GET    | /api/marketplace               | combined: active + installed + available           |
| POST   | /api/extensions/install        | registryManager.install + extensionManager.install |
| POST   | /api/extensions/activate       | extensionManager.activate                          |
| POST   | /api/extensions/deactivate     | extensionManager.deactivate                        |
| DELETE | /api/extensions/:name          | extensionManager.remove                            |
| POST   | /api/run                       | commandRegistry.resolve + execute                  |
| WS     | /api/logs                      | real-time log stream                               |
| GET    | /api/settings                  | configManager.getGlobal                            |
| PUT    | /api/settings                  | configManager.setGlobal                            |
| GET    | /api/settings/extensions/:name | configResolver.resolve                             |
| PUT    | /api/settings/extensions/:name | configManager.setExtensionConfig                   |
| GET    | /api/vault                     | vaultManager.list (masked)                         |
| POST   | /api/vault                     | vaultManager.set                                   |
| PUT    | /api/vault/:key                | vaultManager.set (update)                          |
| DELETE | /api/vault/:key                | vaultManager.remove                                |
| GET    | /api/registries                | registryManager.list                               |
| POST   | /api/registries                | add to global config                               |
| DELETE | /api/registries/:name          | remove from config                                 |
| POST   | /api/registries/:name/sync     | registryManager.sync                               |
| GET    | /api/scheduler                 | query scheduled_tasks                              |
| POST   | /api/scheduler                 | insert task                                        |
| PUT    | /api/scheduler/:id             | update task                                        |
| DELETE | /api/scheduler/:id             | delete task                                        |
| POST   | /api/scheduler/:id/trigger     | immediate execution                                |
| GET    | /api/scheduler/:id/history     | task_history (limit 50)                            |

### Team Assignment (Phase 3)

- **Agent A (Server):** Fastify scaffold, all route files, scheduler runner, LAN auth, sleep prevention
- **Agent B (UI):** React app scaffold with shadcn/ui, all feature pages, components
- **Agent C (Integration):** DynamicPanel loader, WebSocket viewer, `renre-kit ui` command

### Phase 3 Gate Validation

- [ ] `pnpm turbo typecheck` — zero errors, no `any`
- [ ] `pnpm turbo lint` — zero warnings
- [ ] `pnpm turbo lint:duplication` — jscpd passes
- [ ] `pnpm turbo test:coverage` — >= 86%
- [ ] All 32 API endpoints implemented and tested
- [ ] All UI pages render correctly with shadcn/ui components

---

## Phase 4: Extension SDK & Ecosystem

### Package: `packages/extension-sdk/` — Domain Structure with shadcn/ui

**Peer deps:** react ^19
**Dependencies:** clsx, tailwind-merge, class-variance-authority
**Dev:** @radix-ui/\* primitives, typescript, vitest, tsup
**UI Components:** shadcn/ui (Radix + Tailwind) — same system as `packages/ui/`, initialized via `npx shadcn@latest init`

```
packages/extension-sdk/
  package.json
  tsconfig.json
  vitest.config.ts
  components.json                             # shadcn/ui config for SDK package
  src/
    index.ts                                  # Main exports: SDK, types, hooks

    # ── CORE ─────────────────────────────────
    core/
      types.ts                                # PanelProps, RenreKitSDK interface, all public types
      sdk.ts                                  # RenreKitSDK class (6 capability groups)
      sdk.test.ts
      api-client.ts                           # HTTP client for dashboard API
      api-client.test.ts

    # ── FEATURES ─────────────────────────────
    features/
      hooks/
        useCommand.ts                         # { run, output, isRunning, error }
        useCommand.test.ts
        useStorage.ts                         # [value, setValue] with persistent sync
        useStorage.test.ts
        useEvents.ts                          # Subscribe/unsubscribe with cleanup
        useEvents.test.ts
        useScheduler.ts                       # { tasks, register, unregister, update }
        useScheduler.test.ts
        useExtension.ts                       # Access SDK from React context
        useExtension.test.ts
      context/
        SDKProvider.tsx                       # React context provider
        SDKProvider.test.tsx

    # ── SHARED COMPONENTS (shadcn/ui based) ──
    # Extension authors import from @renre-kit/extension-sdk/components
    # All built on shadcn/ui (Radix primitives + Tailwind), inheriting dashboard design tokens
    components/
      ui/                                     # shadcn/ui base components (generated)
        button.tsx
        input.tsx
        select.tsx
        dialog.tsx
        table.tsx
        badge.tsx
        card.tsx
        tabs.tsx
        toast.tsx
        form.tsx
        checkbox.tsx
        alert.tsx
        separator.tsx
        scroll-area.tsx
        switch.tsx
        skeleton.tsx
        tooltip.tsx
        progress.tsx
      index.ts                                # Re-exports all composed components below
      Panel.tsx                               # Extension panel wrapper (uses Card)
      DataTable.tsx                            # Data display table (uses Table)
      CodeBlock.tsx                            # Syntax-highlighted code (uses Card)
      LogViewer.tsx                            # Scrollable log output (uses ScrollArea)
      FormField.tsx                            # Form field wrapper (uses Form)
      Modal.tsx                               # Dialog wrapper (uses Dialog)
      Spinner.tsx                             # Loading indicator
      ProgressBar.tsx                         # Progress display (uses Progress)
      EmptyState.tsx                          # Empty state placeholder
      SearchBar.tsx                           # Search input (uses Input)
      Split.tsx                               # Split pane layout
      SidebarNav.tsx                          # Navigation sidebar

packages/create-renre-extension/              # Scaffolding tool
  package.json
  src/
    index.ts                                  # CLI: prompts for name, type, options
    templates/
      standard/                               # Standard extension template
      mcp/                                    # MCP extension template

extensions/hello-world/                       # Reference standard extension
```

### SDK Capability Groups

1. **Project Context** — `sdk.project.name`, `.path`, `.config` (read-only)
2. **Command Execution** — `sdk.exec(cmd, args)` + `sdk.execStream(cmd, args)`
3. **Persistent Storage** — `sdk.storage.get/set/delete/list` scoped to `.renre-kit/storage/{ext}/`
4. **Dashboard UI Helpers** — `sdk.ui.toast()`, `.confirm()`, `.navigate()`
5. **Cross-Extension Events** — `sdk.events.on/off/emit` with auto-cleanup
6. **Scheduler** — `sdk.scheduler.register/list/unregister/update`

### Team Assignment (Phase 4)

- **Agent A:** SDK types, core class, API client, context provider
- **Agent B:** React hooks + shared component library (shadcn/ui based)
- **Agent C:** create-renre-extension scaffolding + reference extensions + SKILL.md docs

### Phase 4 Gate Validation

- [ ] `pnpm turbo typecheck` — zero errors, no `any`
- [ ] `pnpm turbo lint` — zero warnings
- [ ] `pnpm turbo lint:duplication` — jscpd passes
- [ ] `pnpm turbo test:coverage` — >= 86%
- [ ] Reference extensions install, activate, run commands, render UI panel

---

## Testing Strategy — TDD

| Layer          | Tool                                  | Coverage Target | When                        |
| -------------- | ------------------------------------- | --------------- | --------------------------- |
| Unit           | Vitest                                | 86% minimum     | Before implementation (TDD) |
| Integration    | Vitest (temp dirs, real SQLite)       | Key flows       | After unit tests            |
| E2E (Phase 3+) | Playwright                            | Dashboard flows | After integration           |
| Convention     | `*.test.ts` co-located in same folder | All packages    | Always                      |

### Vitest Config (per package)

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      thresholds: {
        statements: 86,
        branches: 86,
        functions: 86,
        lines: 86,
      },
    },
  },
});
```

### Key Integration Tests

- **init-flow:** Full init in temp dir, verify files + DB state
- **ext-lifecycle:** add -> activate (triggers onInit hook) -> deactivate (triggers onDestroy hook) -> remove
- **mcp-stdio:** Spawn mock MCP server, JSON-RPC round-trip
- **vault-lifecycle:** Create entry, configure extension, resolve config, verify flow
- **versioning-flow:** Install v1, pin, install v2, update pin, cleanup v1
- **api-integration:** Start real Fastify, HTTP requests, verify end-to-end

---

## Verification Plan (per phase)

### After Each Phase

1. **Plan vs. Implementation Audit:**
   - Walk through every item in this plan for the completed phase
   - Verify every file exists, every function is implemented, every type is defined
   - **If gaps found → implement immediately before proceeding**

2. **Quality Checks (must ALL pass):**

   ```bash
   pnpm turbo typecheck          # tsc --noEmit, zero errors, no `any` types
   pnpm turbo lint               # ESLint: complexity<=10, cognitive<=15, zero warnings
   pnpm turbo lint:duplication   # jscpd: no significant duplication
   pnpm turbo test:coverage      # Vitest: >= 86% coverage
   pnpm turbo build              # Clean build, zero errors
   ```

3. **Functional Verification:**
   - **Phase 1:** `renre-kit init` + `ext:add` mock extension + `ext:list` + verify SQLite + `.renre-kit/` structure
   - **Phase 2:** `vault:set --secret` + `ext:config` mapping + verify encrypted vault.json + config resolution
   - **Phase 3:** `renre-kit ui` + dashboard loads + navigate all pages + marketplace install + LAN PIN auth
   - **Phase 4:** `create-renre-extension` + build + install + run commands + dashboard panel + SKILL.md

---

## Architecture References

- **Source of truth:** `renre-kit-architecture/README.md`
- **ADRs:** `renre-kit-architecture/adr/` (23 ADRs across 8 topic areas)
- **Database schema:** `renre-kit-architecture/diagrams/database-schema.md`
- **Data flows:** `renre-kit-architecture/diagrams/dfd-overview.md`
