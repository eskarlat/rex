# RenreKit CLI — Architecture Document

> **Version:** 1.0.0-draft | **Date:** March 2026

A lightweight, plugin-driven development CLI that provides developers with a unified interface for managing project tooling. At its core, the CLI is intentionally minimal, offering only project lifecycle management and extension orchestration. All domain-specific functionality is delivered through extensions that provide three interaction modes: terminal commands, web-based UI panels, and LLM skill definitions.

The architecture follows a **Microkernel (Plugin Architecture)** pattern where the thin core handles discovery, loading, and routing while extensions provide the actual capabilities.

> **ADR:** [ADR-001 Microkernel Architecture](adr/core/ADR-001-microkernel-architecture.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Core CLI](#3-core-cli)
4. [Extension System](#4-extension-system)
5. [MCP Extensions](#5-mcp-extensions)
6. [Vault & Configuration System](#6-vault--configuration-system)
7. [Web Dashboard](#7-web-dashboard)
8. [Extension SDK](#8-extension-sdk)
9. [LLM Skills System](#9-llm-skills-system)
10. [Scheduler System](#10-scheduler-system)
11. [Error Handling & Logging](#11-error-handling--logging)
12. [Security & Trust Model](#12-security--trust-model)
13. [Database Schema](#13-database-schema)
14. [MVP Scope](#14-mvp-scope)

**Additional Resources:**

- [Database Schema Diagrams](diagrams/database-schema.md)
- [Data Flow Diagrams](diagrams/dfd-overview.md)
- [Architecture Decision Records](adr/)

---

## 1. Executive Summary

RenreKit CLI is a lightweight, extensible command-line tool that provides developers with a unified interface for managing project tooling. At its core, the CLI is intentionally minimal, offering only project lifecycle management and extension orchestration. All domain-specific functionality is delivered through extensions that provide three interaction modes: terminal commands, web-based UI panels, and LLM skill definitions.

### 1.1 Key Design Principles

- **Lightweight Core:** The CLI ships with only project lifecycle and extension management. No bloat.
- **Three-Interface Model:** Every extension can expose terminal commands, a web dashboard UI panel, and LLM skills, giving developers CLI, visual, and AI access to the same functionality.
- **Global Install, Local Activation:** Extensions are installed once and shared across projects. Each project activates only what it needs.
- **Dual Runtime:** Extensions can be standard (in-process JS) or MCP-based (stdio/SSE), unified behind the same command registry.
- **Central Vault:** Credentials are stored once and referenced by any extension, eliminating duplication and simplifying rotation.
- **Convention Over Configuration:** Standard manifest format, predictable file structure, minimal setup required.

---

## 2. System Overview

### 2.1 High-Level Architecture

The system is composed of four packages organized as a monorepo. The CLI package handles terminal interactions, the Server package exposes a REST/WebSocket API for the web dashboard, the UI package is the React-based web dashboard, and the Extension SDK provides the contract for extension authors.

| Layer             | Responsibility                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| CLI Parser        | Argument parsing, subcommand routing via Commander.js                                    |
| Command Registry  | Unified lookup table mapping namespaced commands to handlers (core + extensions)         |
| Core Commands     | Built-in commands: init, destroy, ext:_, vault:_, ui, capabilities                       |
| Extension Runtime | Dual runtime: in-process JS for standard extensions, MCP proxy for stdio/SSE extensions  |
| ConnectionManager | Manages MCP server processes (stdio) and remote connections (SSE) with lifecycle control |
| Event Bus         | Pub/sub system for lifecycle hooks (project:init, project:destroy, etc.)                 |
| Managers          | ProjectManager (SQLite), ExtensionManager (install, resolve), Vault (credentials)        |
| File System       | Global state in ~/.renre-kit (DB, vault, extensions), project state in ./.renre-kit      |

### 2.2 Monorepo Package Structure

The project uses Turborepo with pnpm workspaces to manage four interdependent packages:

| Package       | Path                      | Description                                                           |
| ------------- | ------------------------- | --------------------------------------------------------------------- |
| cli           | `packages/cli/`           | Core CLI: commander, clack prompts, SQLite, file ops                  |
| server        | `packages/server/`        | Web dashboard backend: Fastify, REST API, WebSocket                   |
| ui            | `packages/ui/`            | Web dashboard frontend: Vite, React, Tailwind, shadcn/ui              |
| extension-sdk | `packages/extension-sdk/` | SDK for extension authors: API client, React components, hooks, types |

### 2.3 File System Layout

**Global (shared across all projects)** — Located at `~/.renre-kit/`:

| Path                       | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `~/.renre-kit/db.sqlite`   | Project registry: name, path, created date, active extensions                 |
| `~/.renre-kit/extensions/` | Downloaded extension packages, versioned (e.g., figma@1.2.0/)                 |
| `~/.renre-kit/registries/` | Locally cloned registry repos with extensions.json and .fetched_at timestamps |
| `~/.renre-kit/vault.json`  | Central credential store: named variables with optional encryption and tags   |
| `~/.renre-kit/config.json` | Global CLI settings, registry config, and per-extension config mappings       |
| `~/.renre-kit/logs/`       | Rotating daily log files for CLI operations                                   |

**Per-Project (local to each project)** — Created in the project root during `renre-kit init`:

| Path                             | Purpose                                                              |
| -------------------------------- | -------------------------------------------------------------------- |
| `.renre-kit/manifest.json`       | Project metadata: name, version, created timestamp                   |
| `.renre-kit/plugins.json`        | Activated extensions with exact version pinning for this project     |
| `.renre-kit/storage/`            | Extension-scoped persistent storage (key/value JSON files)           |
| `.agents/skills/{name}/SKILL.md` | LLM skill files copied from activated extensions during init/ext:add |
| `.agents/prompts/{name}/`        | Prompt templates deployed by extensions via onInit lifecycle export  |
| `.agents/agents/{name}/`         | Agent definitions with system prompts and tool configurations        |
| `.agents/workflows/{name}/`      | Multi-step workflow scripts for complex LLM automation               |
| `.agents/context/{name}/`        | Reference documents, schemas, and examples for enriched LLM context  |

---

## 3. Core CLI

### 3.1 Technology Stack

| Dependency       | Purpose                       | Why This Choice                                             |
| ---------------- | ----------------------------- | ----------------------------------------------------------- |
| `commander`      | Argument parsing, subcommands | Lightweight, unopinionated, full control over plugin system |
| `@clack/prompts` | Interactive terminal UI       | Modern UX (select, multiselect, spinner), minimal API       |
| `better-sqlite3` | Project registry database     | Synchronous API, no async complexity for CLI                |
| `fs-extra`       | File operations               | Reliable copy, move, remove with promises                   |

> **ADRs:** [ADR-002 SQLite Project Registry](adr/core/ADR-002-sqlite-project-registry.md) | [ADR-003 Technology Stack](adr/core/ADR-003-technology-stack.md)

### 3.2 Built-in Commands

| Command                            | Description                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `renre-kit init`                   | Initialize a new project: prompt for name, select extensions, create local .renre-kit/ and global DB record |
| `renre-kit destroy`                | Full cleanup: remove local .renre-kit/ folder, call onDestroy exports, delete project from global DB        |
| `renre-kit ext:add <name>`         | Install extension globally (if not cached) and activate for current project                                 |
| `renre-kit ext:remove <name>`      | Deactivate from current project; warn if other projects use it before global removal                        |
| `renre-kit ext:list`               | Show all globally installed extensions with per-project activation status                                   |
| `renre-kit ext:activate <name>`    | Activate a globally installed extension for the current project (copy SKILL.md, run onInit from main entry) |
| `renre-kit ext:deactivate <name>`  | Deactivate extension from current project only (keep installed globally, MCP processes stay alive)          |
| `renre-kit ext:config <name>`      | Interactive config setup: map extension config fields to vault variables or direct values                   |
| `renre-kit ext:status`             | Show connection state for MCP extensions (running, connected, stopped)                                      |
| `renre-kit ext:restart <name>`     | Restart a stdio MCP server process for the specified extension                                              |
| `renre-kit ext:outdated`           | Compare installed versions against registries, show available updates                                       |
| `renre-kit ext:update <name>`      | Update extension to latest version for current project (or --all for all extensions)                        |
| `renre-kit ext:cleanup`            | Remove extension versions not referenced by any registered project                                          |
| `renre-kit vault:set <key>`        | Store a variable in the vault; use --secret flag for masked input of sensitive values                       |
| `renre-kit vault:list`             | List all vault variables (secrets shown masked)                                                             |
| `renre-kit vault:remove <key>`     | Remove a variable from the vault; warns if referenced by any extension config                               |
| `renre-kit registry:sync`          | Force-refresh all configured registries regardless of cacheTTL                                              |
| `renre-kit registry:list`          | Show configured registries with sync status and last fetched timestamp                                      |
| `renre-kit scheduler:list`         | List all scheduled tasks for the current project with status and next run time                              |
| `renre-kit scheduler:trigger <id>` | Manually trigger an immediate execution of a scheduled task                                                 |
| `renre-kit capabilities`           | Concatenate all active SKILL.md files into a single context for LLM consumption                             |
| `renre-kit ui`                     | Start local web dashboard server and open browser. Flags: --port, --lan, --no-browser, --no-sleep           |

### 3.3 Project Lifecycle

**Initialization Flow** — When the user runs `renre-kit init`:

1. **Prompt for project name** using @clack/prompts text input, defaulting to the current directory name.
2. **Display extension picker** showing all globally installed extensions as a multiselect list.
3. **Create local .renre-kit/ directory** with manifest.json and plugins.json.
4. **Register in global database** inserting a new record in ~/.renre-kit/db.sqlite.
5. **Copy SKILL.md files** from each activated extension into .agents/skills/{name}/SKILL.md.
6. **Import each extension's `main` module** and call the `onInit` named export, passing the project context.

**Destroy Flow** — When the user runs `renre-kit destroy`:

1. **Prompts for confirmation** showing what will be removed. Supports --force flag to skip.
2. **Calls onDestroy exports** from each activated extension's `main` module, allowing cleanup.
3. **Removes .agents/skills/ entries** for each activated extension.
4. **Deletes .renre-kit/ directory** removing all local configuration.
5. **Removes project from global DB** deleting the SQLite record.

### 3.4 Command Registry Pattern

The Command Registry is the routing layer that maps user input to command handlers. When the CLI boots inside a project directory, it reads `.renre-kit/plugins.json`, loads each activated extension's manifest, and registers all their commands into a unified lookup table.

Command resolution follows the pattern `namespace:command`. Core commands have no namespace (`init`, `destroy`). Extension commands are namespaced by extension name (`figma:content`, `atlassian:getJiraTickets`). If a command is not found in the registry, the CLI displays an error with suggestions for similar commands.

---

## 4. Extension System

### 4.1 Architecture Pattern

The extension system uses a **Global Install / Local Activation** model. Extensions are downloaded once to a shared global directory and can be activated independently in each project. This provides offline support, fast execution, version pinning per project, and shared disk space.

> **ADR:** [ADR-001 Global Install / Local Activation](adr/extensions/ADR-001-global-install-local-activation.md)

### 4.2 Extension Types

The system supports three extension types, unified behind the same command registry and SDK:

| Type        | Runtime                                                            | Use Case                                       |
| ----------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| standard    | In-process JS: commands are require()'d and executed directly      | Lightweight tools, file processors, generators |
| mcp (stdio) | CLI spawns a child process, communicates via stdin/stdout JSON-RPC | MCP servers bundled inside the extension       |
| mcp (sse)   | CLI connects to an existing server over HTTP/SSE                   | Remote or shared MCP servers already running   |

> **ADR:** [ADR-002 Extension Types](adr/extensions/ADR-002-extension-types.md)

### 4.3 Extension Manifest

Every extension contains a `manifest.json` that declares its capabilities:

| Field           | Type   | Description                                                                              |
| --------------- | ------ | ---------------------------------------------------------------------------------------- |
| `name`          | string | Unique extension identifier used as command namespace                                    |
| `version`       | string | Semantic version (e.g., 1.2.0)                                                           |
| `description`   | string | Short description shown in extension picker during init                                  |
| `icon`          | string | Path to icon image file (e.g., assets/icon.png) for marketplace and dashboard sidebar    |
| `iconColor`     | string | Hex color for icon background/accent in the dashboard                                    |
| `type`          | string | Extension type: "standard" (default) or "mcp"                                            |
| `commands`      | object | Map of command names to JS entry files (standard) or MCP tool names (mcp)                |
| `mcp`           | object | MCP config: transport (stdio/sse), command/args or url, env variable mappings            |
| `config.schema` | object | Declares required config fields with type, description, secret flag, and vaultHint       |
| `main`          | string | Single entry point module exporting lifecycle hooks (onInit, onDestroy) as named exports |
| `skills`        | string | Path to SKILL.md file (copied to .agents/skills/{name}/ on activation)                   |
| `ui.panels`     | array  | Web dashboard panel definitions with id, title, and entry path                           |
| `agent`         | string | Path to agent/ directory containing extended LLM assets deployed via hooks               |

### 4.4 Extension File Structure

| File / Directory         | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `manifest.json`          | Extension metadata, command declarations, main entry point                         |
| `assets/icon.png`        | Extension icon for marketplace listing and dashboard sidebar                       |
| `src/index.js`           | Main entry point: exports onInit/onDestroy lifecycle hooks as named exports        |
| `commands/{name}.js`     | Individual command handler files (one per command, exports `default` or `execute`) |
| `skills/{name}/SKILL.md` | Markdown skill files: teach LLMs how to use this extension's commands              |
| `ui/panel.js`            | Pre-built React component bundle for web dashboard panel                           |
| `agent/`                 | Extended LLM assets: prompts/, agents/, workflows/, context/ (deployed via onInit) |
| `server/` (MCP only)     | Bundled MCP server: index.js, node_modules, package.json                           |

### 4.5 Extension Command Contract

Every extension command exports a standard interface. The CLI injects an `ExecutionContext` object:

| Context Property | Type                | Description                                            |
| ---------------- | ------------------- | ------------------------------------------------------ |
| `projectName`    | string              | Name of the current project                            |
| `projectPath`    | string              | Absolute path to the project root                      |
| `args`           | Record<string, any> | Parsed command arguments and flags                     |
| `config`         | Record<string, any> | Extension-specific configuration from project manifest |

**Argument Validation** — Commands can optionally export a `argsSchema` (Zod schema) alongside their handler. When present, the CLI validates `context.args` against the schema before invoking the handler, providing consistent error messages and applying defaults. This works for both standard and MCP extensions with custom local command handlers.

```typescript
// commands/greet.ts
import { z } from 'zod';

export const argsSchema = z.object({
  name: z.string({ required_error: '--name is required' }),
  loud: z.boolean().default(false),
});

export default function greet(context: ExecutionContext): CommandResult {
  const { name, loud } = context.args as z.infer<typeof argsSchema>;
  // name is guaranteed string, loud defaults to false
}
```

### 4.6 Git-Based Registry

The extension registry is a **git repository** containing an `extensions.json` file that lists all available extensions. The CLI clones this repository locally and uses **the developer's existing git credentials** (SSH keys, credential helpers, PATs) for authentication.

> **ADR:** [ADR-003 Git-Based Registry](adr/extensions/ADR-003-git-based-registry.md)

**Multiple Registries with Priority** — A company can maintain an internal registry alongside the public community registry:

| Config Field | Type   | Description                                                                 |
| ------------ | ------ | --------------------------------------------------------------------------- |
| `name`       | string | Human-readable registry name (e.g., "internal", "community")                |
| `url`        | string | Git URL of the registry repo (SSH or HTTPS)                                 |
| `priority`   | number | Resolution order: lower = higher priority                                   |
| `cacheTTL`   | number | Seconds before local clone is refreshed. 0 = always-fetch, -1 = manual-only |

**Cache & Sync Behavior** — Each registry is cloned into `~/.renre-kit/registries/{name}/` on first access. The CLI stores a `.fetched_at` timestamp. If stale, it runs `git pull`; if fresh, it reads from cache. Offline mode uses stale cache with a warning.

**Extension Resolution Flow** — When `renre-kit ext:add figma` runs, the CLI iterates registries in priority order, finds the first match, and clones the extension repo using `git clone --branch v{version} --depth 1` into `~/.renre-kit/extensions/{name}@{version}/`.

**Registry Format & Extension Publishing** — The `extensions.json` in each registry repo:

| Field           | Type   | Description                                            |
| --------------- | ------ | ------------------------------------------------------ |
| `name`          | string | Unique extension identifier (must match manifest name) |
| `description`   | string | Short description shown in marketplace and ext:list    |
| `gitUrl`        | string | Git repository URL (SSH or HTTPS)                      |
| `latestVersion` | string | Latest stable version (must correspond to a git tag)   |
| `type`          | string | Extension type: "standard" or "mcp"                    |
| `icon`          | string | Base64-encoded icon thumbnail for marketplace display  |
| `author`        | string | Author or organization name                            |

Publishing follows a **pull request workflow**. The author adds/updates their entry and submits a PR. A CI validation check verifies the git URL, tag existence, and manifest validity.

> **ADR:** [ADR-007 PR-Based Publishing](adr/extensions/ADR-007-pr-based-publishing.md)

### 4.7 Lifecycle Hooks & Event Bus

| Event             | Trigger                                                |
| ----------------- | ------------------------------------------------------ |
| `project:init`    | After project directory structure is created           |
| `project:destroy` | Before local .renre-kit/ directory is deleted          |
| `ext:activate`    | When an extension is activated for the current project |
| `ext:deactivate`  | When an extension is removed from the current project  |

### 4.8 Extension Versioning & Updates

RenreKit uses **exact version pinning** — each project records the precise version in `.renre-kit/plugins.json` (e.g., `"figma": "1.2.0"`). Multiple versions coexist on disk. Two projects can safely pin different versions.

> **ADR:** [ADR-006 Exact Version Pinning](adr/extensions/ADR-006-exact-version-pinning.md)

| Command                       | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| `renre-kit ext:outdated`      | Compare installed versions against registries          |
| `renre-kit ext:update <name>` | Download latest version, update pin in current project |
| `renre-kit ext:update --all`  | Update all extensions for the current project          |
| `renre-kit ext:cleanup`       | Garbage collect versions not referenced by any project |

**Update Flow:** Downloads new version into a new directory, imports `main` and calls `onInit`, updates plugins.json pin, re-copies SKILL.md and agent assets. Old version stays for other projects.

**Garbage Collection:** `ext:cleanup` scans all projects' plugins.json, builds referenced set, deletes unreferenced directories. Never automatic — always explicit.

**Dashboard Integration:** Marketplace shows "update available" badges. Clicking runs the same flow as `ext:update`.

---

## 5. MCP Extensions

### 5.1 Overview

MCP extensions manage a server process that communicates via JSON-RPC. Two transports: **stdio** (CLI spawns and manages a local child process) and **SSE** (CLI connects to an already-running server over HTTP).

MCP servers are **bundled inside the extension package**. This ensures offline support, version consistency, and no external dependencies.

> **ADR:** [ADR-005 Bundled MCP Servers](adr/extensions/ADR-005-bundled-mcp-servers.md)

### 5.2 ConnectionManager

| Transport | Behavior                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| stdio     | Spawns child process, wires stdin/stdout pipes, manages lifecycle (lazy start, idle timeout, auto-restart on crash) |
| sse       | Establishes HTTP connection with auth headers, handles reconnection, manages keep-alive                             |

### 5.3 Command Routing for MCP Extensions

For MCP extensions, the command maps to an MCP tool name. The registry resolves the extension, sees it's MCP type, routes through the ConnectionManager, ensures the server is running, sends a `tools/call` JSON-RPC request, and returns the response.

### 5.4 Process Lifecycle

| Context                  | Strategy                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| CLI (single command)     | Lazy start: spawn on first command, keep alive 30s, then shut down      |
| Dashboard (renre-kit ui) | Eager start: spawn all activated MCP extensions, keep alive for session |
| Crash recovery           | Auto-restart with exponential backoff; after 3 failures, mark errored   |

### 5.5 MCP Manifest Configuration

| Field           | Transport | Description                                           |
| --------------- | --------- | ----------------------------------------------------- |
| `mcp.transport` | both      | "stdio" or "sse"                                      |
| `mcp.command`   | stdio     | Executable to spawn (e.g., "node")                    |
| `mcp.args`      | stdio     | Arguments (e.g., ["server/index.js"])                 |
| `mcp.env`       | stdio     | Environment variables with ${config.\*} interpolation |
| `mcp.url`       | sse       | Server URL with ${config.\*} interpolation            |
| `mcp.headers`   | sse       | HTTP headers for authentication                       |

---

## 6. Vault & Configuration System

### 6.1 Overview

Two-layer configuration: a **central vault** for credentials and **per-extension config mappings** that reference vault entries. Users enter a credential once; any number of extensions reference it by name.

> **ADR:** [ADR-001 Central Vault with Indirection](adr/vault/ADR-001-central-vault-indirection.md)

### 6.2 Vault

Located at `~/.renre-kit/vault.json`. Secrets encrypted at rest, masked in output.

| Property | Type     | Description                            |
| -------- | -------- | -------------------------------------- |
| `value`  | string   | The stored value (encrypted if secret) |
| `secret` | boolean  | If true, encrypted at rest and masked  |
| `tags`   | string[] | Optional tags for smart matching       |

> **ADR:** [ADR-002 AES-256-GCM Encryption](adr/vault/ADR-002-aes256-encryption.md)

### 6.3 Extension Config Resolution

Extensions declare config fields via `config.schema`. Resolution chain: **project config** → **global config** → **schema defaults**.

Config mappings stored in `~/.renre-kit/config.json` (global) and `.renre-kit/manifest.json` (per-project overrides). Each field records source: `"vault"` with key reference, or `"direct"` with inline value.

The naming mismatch problem is solved by this indirection. An extension expects `apiToken`, the user stores their token as `jira_token` in the vault, the config mapping connects them, and the MCP manifest injects it as `ATLASSIAN_TOKEN`. Three separate concerns, fully decoupled.

### 6.4 Auto-Generated Settings Pages

The dashboard generates settings pages by reading `config.schema`. Each field renders as a form control with vault variable dropdowns using smart matching (`vaultHint` vs vault `tags`).

### 6.5 CLI Config Setup

Available via `renre-kit ext:config <name>`. Interactive picker for each config field with vault variables, direct value entry, and new vault variable creation.

---

## 7. Web Dashboard

### 7.1 Overview

The web dashboard is a locally-served React application launched via `renre-kit ui`. It starts a Fastify server on a configurable localhost port and opens the browser. The dashboard has **zero business logic** — every action translates to calling CLI core managers through a REST API layer.

> **ADRs:** [ADR-001 Localhost Web Dashboard](adr/dashboard/ADR-001-localhost-web-dashboard.md) | [ADR-002 Zero Business Logic](adr/dashboard/ADR-002-zero-business-logic.md)

### 7.2 Multi-Project Support

A **project switcher dropdown** in the top nav lists all registered projects. Switching projects does **not** stop MCP server processes — the **command registry becomes project-scoped** instead. Every API request includes `X-RenreKit-Project` header.

### 7.3 Dashboard Layout

The sidebar shows only **active extensions** for the current project:

| Sidebar Element  | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Project Switcher | Dropdown listing all registered projects                              |
| Home             | Project overview: active extensions, recent commands, quick actions   |
| Extension Panels | One entry per active extension (with icon)                            |
| Marketplace      | Centralized extension management                                      |
| Vault            | Central credential store management                                   |
| Scheduled Tasks  | Task list with status, next run, manual trigger, history              |
| Settings         | Settings page with sub-sidebar (see [Section 7.9](#79-settings-page)) |

### 7.4 Marketplace Page

Single place for all extension management:

| Section                | Shows                                    | Actions                           |
| ---------------------- | ---------------------------------------- | --------------------------------- |
| Active in this project | Extensions activated for current project | Deactivate, open settings         |
| Installed              | Globally installed but not active        | Activate, Remove, open settings   |
| Available              | From registries, not yet installed       | Install (and optionally activate) |

### 7.5 Technology Stack

| Technology     | Layer      | Role                                                   |
| -------------- | ---------- | ------------------------------------------------------ |
| `Fastify`      | Server     | HTTP + WebSocket server, REST API and static assets    |
| `Vite`         | Build      | Frontend bundler, dev server                           |
| `React`        | Frontend   | Component framework for dashboard and extension panels |
| `Tailwind CSS` | Styling    | Utility-first CSS with design tokens                   |
| `shadcn/ui`    | Components | Owned component source (Radix primitives + Tailwind)   |

### 7.6 Server API

Every request includes `X-RenreKit-Project` header:

| Method | Endpoint                         | Description                                  |
| ------ | -------------------------------- | -------------------------------------------- |
| GET    | `/api/projects`                  | List all registered projects                 |
| PUT    | `/api/projects/active`           | Switch active project context                |
| GET    | `/api/project`                   | Current project info                         |
| GET    | `/api/marketplace`               | All extensions: active, installed, available |
| POST   | `/api/extensions/install`        | Install extension globally                   |
| POST   | `/api/extensions/activate`       | Activate for current project                 |
| POST   | `/api/extensions/deactivate`     | Deactivate from current project              |
| DELETE | `/api/extensions/:name`          | Remove globally                              |
| POST   | `/api/run`                       | Execute a command                            |
| WS     | `/api/logs`                      | Real-time command output streaming           |
| GET    | `/api/settings`                  | Retrieve global settings                     |
| PUT    | `/api/settings`                  | Update global settings                       |
| GET    | `/api/settings/extensions/:name` | Get resolved extension config                |
| PUT    | `/api/settings/extensions/:name` | Update extension config mappings             |
| GET    | `/api/vault`                     | List vault entries (masked)                  |
| POST   | `/api/vault`                     | Create vault entry                           |
| PUT    | `/api/vault/:key`                | Update vault entry                           |
| DELETE | `/api/vault/:key`                | Remove vault entry                           |
| GET    | `/api/registries`                | List registries with sync status             |
| POST   | `/api/registries`                | Add a new registry                           |
| DELETE | `/api/registries/:name`          | Remove a registry                            |
| POST   | `/api/registries/:name/sync`     | Force-sync a specific registry               |
| GET    | `/api/scheduler`                 | List scheduled tasks                         |
| POST   | `/api/scheduler`                 | Register a new task                          |
| PUT    | `/api/scheduler/:id`             | Update a task                                |
| DELETE | `/api/scheduler/:id`             | Remove a task                                |
| POST   | `/api/scheduler/:id/trigger`     | Manually trigger a task                      |
| GET    | `/api/scheduler/:id/history`     | Execution history (last 50 runs)             |

### 7.7 Extension UI Loading

Extension UI panels are loaded via **dynamic JavaScript imports** rather than iframes. Each extension ships a pre-built React component bundle loaded at runtime using `import()`. Components render in the dashboard's React tree, inheriting theme and layout.

Each panel is wrapped in a **React Error Boundary**. Extensions declare `react` and `@renre-kit/extension-sdk` as peer dependencies.

> **ADR:** [ADR-004 Dynamic Imports vs Iframes](adr/extensions/ADR-004-dynamic-imports-vs-iframes.md)

### 7.8 Theming

CSS custom properties (design tokens) on `:root`. Extension UIs inherit tokens automatically. Custom themes via CSS variable overrides.

### 7.9 Settings Page

Centralized location for global CLI and per-extension settings with its own **sub-sidebar navigation**:

| Section                      | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| General                      | Default port, theme, telemetry, log verbosity        |
| Registries                   | Manage URLs, priority, cacheTTL, manual sync         |
| Vault                        | List/add/edit/remove vault entries                   |
| Extension Settings (dynamic) | One entry per installed extension with config.schema |

> **ADR:** [ADR-005 Settings Sub-Sidebar](adr/dashboard/ADR-005-settings-sub-sidebar.md)

**Auto-Generated Extension Settings Forms:** Each config field renders appropriate controls. Secret fields show vault key dropdowns with smart matching. Fields can be overridden per-project with a reset-to-global option.

### 7.10 LAN Access

By default, binds to `127.0.0.1`. With `--lan` flag, binds to `0.0.0.0` for WiFi/LAN access.

> **ADR:** [ADR-003 PIN-Based LAN Auth](adr/dashboard/ADR-003-pin-based-lan-auth.md)

**PIN-Based Authentication:** On startup, generates a random 4-digit PIN printed in the terminal:

```
Dashboard running at http://192.168.1.42:4200 (LAN mode)
PIN: 7241 — enter this on remote devices to access the dashboard
```

LAN devices see a `window.prompt()` dialog asking for the PIN. Correct PIN sets a session cookie. Localhost bypasses PIN entirely.

| Setting        | Description                         |
| -------------- | ----------------------------------- |
| `network.lan`  | Enable LAN binding (default: false) |
| `network.port` | Dashboard port (default: 4200)      |

### 7.11 Sleep Prevention

Auto-activates when dashboard starts. Configurable via `server.preventSleep`.

| Platform | Implementation                                                 |
| -------- | -------------------------------------------------------------- |
| macOS    | Spawns `caffeinate -di` as child process                       |
| Linux    | Uses `systemd-inhibit --what=idle`                             |
| Windows  | `SetThreadExecutionState(ES_CONTINUOUS \| ES_SYSTEM_REQUIRED)` |

> **ADR:** [ADR-004 Sleep Prevention](adr/dashboard/ADR-004-sleep-prevention.md)

---

## 8. Extension SDK

### 8.1 Overview

The `@renre-kit/extension-sdk` package provides the runtime API client, shared React component library, hooks, and TypeScript types.

> **ADRs:** [ADR-001 shadcn/ui Components](adr/sdk/ADR-001-shadcn-ui-components.md) | [ADR-002 Dynamic Scheduler Registration](adr/sdk/ADR-002-dynamic-scheduler-registration.md)

### 8.2 SDK Core API

The `RenreKitSDK` interface is injected into every extension UI panel as a prop. Six capability groups:

- **Project Context** — Read-only access to project name, path, and configuration.
- **Command Execution** — `exec()` for quick operations, `execStream()` for long-running commands with real-time streaming.
- **Persistent Storage** — Extension-scoped key/value storage in `.renre-kit/storage/<extension-name>/`.
- **Dashboard UI Helpers** — Toasts, confirmation dialogs, programmatic navigation.
- **Cross-Extension Events** — Pub/sub event system between extension UIs. Auto-cleanup on unmount.
- **Scheduler** — Dynamic task scheduling via `sdk.scheduler`. `register()`, `list()`, `unregister()`. Tasks persist across dashboard restarts. See [Section 10](#10-scheduler-system).

### 8.3 React Hooks

| Hook           | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `useCommand`   | Wraps exec/execStream into React state: run(), output, isRunning, error |
| `useStorage`   | React state backed by persistent extension storage with auto-sync       |
| `useEvents`    | Subscribe to cross-extension events with automatic cleanup              |
| `useScheduler` | Manage scheduled tasks: register, list, update, unregister              |
| `useExtension` | Access the full SDK instance from any nested component                  |

### 8.4 Shared Component Library

Built on **shadcn/ui** (Radix primitives + Tailwind). Inherits dashboard design tokens.

**Layout Components:** Panel, Tabs/Tab, Split, Sidebar

**Data Display Components:** DataTable, CodeBlock, LogViewer, Badge, EmptyState

**Input & Form Components:** Button, Input/Select/Checkbox, Form/FormField, SearchBar

**Feedback Components:** Modal, Spinner/ProgressBar, Alert, Toast

---

## 9. LLM Skills System

### 9.1 Concept

Each extension can ship a **SKILL.md** file that teaches an LLM how to use the extension's commands. When a developer installs an extension, an AI agent automatically gains the ability to use it. This is the third interaction mode alongside CLI commands and web UI panels.

> **ADR:** [ADR-001 SKILL.md Convention](adr/llm-skills/ADR-001-skill-md-convention.md)

### 9.2 Skill File Format

| Section            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| Extension Overview | Brief description and when to use it        |
| Commands           | Usage patterns, flags, parameters, guidance |
| Common Patterns    | Multi-step workflows                        |
| Examples           | Concrete invocation examples                |
| Notes / Caveats    | Prerequisites, limitations, edge cases      |

### 9.3 Skill Deployment

On activation, the CLI copies `skills/SKILL.md` to `.agents/skills/{extension-name}/SKILL.md`. Convention-based discovery: any LLM agent can scan `.agents/skills/*/SKILL.md`.

### 9.4 Capabilities Command

`renre-kit capabilities` concatenates all active SKILL.md files into a single context output for LLM consumption.

### 9.5 Extended LLM Context

Beyond SKILL.md, extensions can ship additional LLM assets via a two-layer provisioning model:

> **ADR:** [ADR-002 Two-Layer LLM Context](adr/llm-skills/ADR-002-two-layer-llm-context.md)

**Layer 1: Core-Managed (Automatic)** — SKILL.md deployment handled by the CLI core. No custom code needed.

**Layer 2: Extension-Managed (Custom via Hooks)** — Extensions ship an `agent/` directory with assets deployed by `onInit` and cleaned up by `onDestroy`:

| Extension Source   | Project Destination         | Purpose                           |
| ------------------ | --------------------------- | --------------------------------- |
| `agent/prompts/`   | `.agents/prompts/{name}/`   | Reusable prompt templates         |
| `agent/agents/`    | `.agents/agents/{name}/`    | Agent definitions                 |
| `agent/workflows/` | `.agents/workflows/{name}/` | Multi-step workflow scripts       |
| `agent/context/`   | `.agents/context/{name}/`   | Reference docs, schemas, examples |

---

## 10. Scheduler System

### 10.1 Overview

The scheduler enables extensions to register recurring and one-off tasks at runtime via the SDK. Tasks are registered **dynamically** — not declared in manifests.

The scheduler runs as part of the dashboard server process (`renre-kit ui`). When the dashboard is not running, no tasks fire.

> **ADR:** [ADR-001 Dynamic vs Static Registration](adr/scheduler/ADR-001-dynamic-vs-static-registration.md)

### 10.2 Database Schema

See [Database Schema Diagrams](diagrams/database-schema.md) for visual representation.

**scheduled_tasks Table:**

| Column           | Type          | Description                                     |
| ---------------- | ------------- | ----------------------------------------------- |
| `id`             | TEXT PK       | Unique task identifier, namespaced by extension |
| `extension_name` | TEXT NOT NULL | Extension that registered this task             |
| `project_path`   | TEXT          | NULL for global tasks, path for project-scoped  |
| `cron`           | TEXT NOT NULL | Cron expression                                 |
| `command`        | TEXT NOT NULL | CLI command to execute                          |
| `enabled`        | INTEGER       | 1 = active, 0 = paused                          |
| `last_run_at`    | TEXT          | ISO 8601 timestamp of last execution            |
| `last_status`    | TEXT          | "success", "error", or "running"                |
| `next_run_at`    | TEXT NOT NULL | Computed next execution time                    |
| `created_at`     | TEXT NOT NULL | ISO 8601 registration timestamp                 |

**task_history Table:**

| Column        | Type          | Description                                    |
| ------------- | ------------- | ---------------------------------------------- |
| `id`          | INTEGER PK    | Auto-incrementing row ID                       |
| `task_id`     | TEXT NOT NULL | References scheduled_tasks.id (CASCADE DELETE) |
| `started_at`  | TEXT NOT NULL | When execution began                           |
| `finished_at` | TEXT          | When execution completed                       |
| `duration_ms` | INTEGER       | Execution duration in milliseconds             |
| `status`      | TEXT NOT NULL | "success" or "error"                           |
| `output`      | TEXT          | Truncated output (max 10KB)                    |

Rolling limit of 50 rows per task. CASCADE DELETE removes history when task is unregistered.

> **ADR:** [ADR-002 SQLite Task Persistence](adr/scheduler/ADR-002-sqlite-task-persistence.md)

### 10.3 Task Properties

SDK-facing view of scheduled tasks:

| Property        | SDK Type       | Description                  |
| --------------- | -------------- | ---------------------------- |
| `id`            | string         | Unique task identifier       |
| `extensionName` | string         | Owning extension (read-only) |
| `projectPath`   | string \| null | Project scope                |
| `cron`          | string         | Cron expression              |
| `command`       | string         | CLI command to execute       |
| `enabled`       | boolean        | Active state                 |
| `lastRun`       | Date \| null   | Last execution time          |
| `lastStatus`    | string         | Last result                  |
| `nextRun`       | Date           | Next execution time          |

### 10.4 Scheduler Behavior

60-second tick loop checks enabled tasks. Task output captured in rolling log. Project-scoped by default. Config and vault resolved per-project before executing.

Extension deactivation disables tasks for that project. Global uninstall removes all tasks.

### 10.5 Dashboard Scheduler View

**Scheduled Tasks** page in the sidebar. Shows cron schedule, last run status, next run time, enable/disable toggle, manual trigger, and execution history.

---

## 11. Error Handling & Logging

### 11.1 Error Propagation

All extension errors wrapped in `ExtensionError` for consistent reporting:

| Error Source       | Handling                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Standard extension | Try/catch around require() and execute(). Wrapped in ExtensionError                          |
| MCP stdio          | JSON-RPC errors parsed and wrapped. Process crashes trigger restart (3 retries with backoff) |
| MCP SSE            | HTTP errors and connection drops caught. 30-second timeout                                   |
| Lifecycle hooks    | Logged but do not block the operation. Warning shown to user                                 |
| Scheduler tasks    | Recorded in task_history with status "error". Task remains enabled                           |

### 11.2 Logging System

Structured logs in `~/.renre-kit/logs/` with rotating daily files. 7-day retention.

| Level   | Usage                                                                          |
| ------- | ------------------------------------------------------------------------------ |
| `debug` | Verbose: command resolution, config lookups, MCP payloads. Off by default      |
| `info`  | Standard: extension activated, command executed, task scheduled. Default level |
| `warn`  | Non-fatal: stale cache, hook failure, deprecated API                           |
| `error` | Failures: extension crash, MCP disconnect, vault decryption failure            |

Configurable via `logging.level` in settings. Override with `--verbose` (debug) or `--quiet` (error only). Dashboard includes a **Logs viewer page** with filtering by level, source, and time range.

---

## 12. Security & Trust Model

### 12.1 Trust Boundary

RenreKit operates on a **trusted code model**. Extensions run in-process or as local child processes with the same OS-level permissions as the CLI. The **registry serves as the primary trust boundary**.

> **ADR:** [ADR-001 Trusted Code Model](adr/security/ADR-001-trusted-code-model.md)

### 12.2 Vault Security

AES-256-GCM encryption at rest. Machine-specific key derivation. Extensions only access their own resolved config — never direct vault access. Dashboard masks all secret values.

### 12.3 LAN Access Security

4-digit PIN authentication for LAN mode. PIN regenerated on each server start. Session cookies validated server-side. Localhost bypasses PIN.

### 12.4 Post-MVP Security Roadmap

| Feature                 | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| Permission scopes       | Manifest declares required permissions — user approves on install |
| Extension sandboxing    | Forked processes or WASM sandbox                                  |
| OS keychain integration | macOS Keychain / Windows Credential Manager                       |
| Signature verification  | Extensions signed by authors, verified against public keys        |

---

## 13. Database Schema

All state in `~/.renre-kit/db.sqlite` using `better-sqlite3`. See [Database Schema Diagrams](diagrams/database-schema.md) for ER diagram.

### 13.1 projects Table

| Column             | Type          | Description                       |
| ------------------ | ------------- | --------------------------------- |
| `id`               | INTEGER PK    | Auto-incrementing project ID      |
| `name`             | TEXT NOT NULL | Project name                      |
| `path`             | TEXT UNIQUE   | Absolute path to project root     |
| `created_at`       | TEXT NOT NULL | ISO 8601 initialization timestamp |
| `last_accessed_at` | TEXT NOT NULL | Updated on each interaction       |

### 13.2 installed_extensions Table

| Column            | Type          | Description                     |
| ----------------- | ------------- | ------------------------------- |
| `name`            | TEXT NOT NULL | Extension identifier            |
| `version`         | TEXT NOT NULL | Installed version               |
| `registry_source` | TEXT          | Registry this version came from |
| `installed_at`    | TEXT NOT NULL | ISO 8601 installation timestamp |
| `type`            | TEXT NOT NULL | "standard" or "mcp"             |

Composite primary key: (`name`, `version`). Multiple versions of the same extension can coexist.

### 13.3 scheduled_tasks & task_history Tables

See [Section 10.2](#102-database-schema) for full schemas.

---

## 14. MVP Scope

### 14.1 MVP Deliverables

**Phase 1: Core CLI & Extensions**

- Project lifecycle: init with interactive prompts, destroy with cleanup hooks
- Extension management: ext:add, ext:remove, ext:list, ext:config
- Command execution: namespaced commands for standard and MCP types
- MCP support: ConnectionManager with stdio and SSE transports
- Git-based registry: clone-based discovery with PR-based publishing, cacheTTL, multiple registries
- SQLite database: projects, installed extensions, and scheduler tables
- Error handling & logging: ExtensionError wrapper, rotating daily log files

**Phase 2: Vault, Configuration & Versioning**

- Central vault with AES-256-GCM encryption
- Per-extension config schema with vault variable mapping and smart matching
- CLI config setup: vault:set, vault:list, vault:remove, ext:config
- Config resolution chain: project → global → schema defaults
- Extension versioning: exact pinning, ext:outdated, ext:update, ext:cleanup

**Phase 3: Web Dashboard**

- Local Fastify server with REST API and WebSocket (pure CLI proxy)
- React dashboard with project overview, extension management, vault and log viewer
- Settings page with sub-sidebar: General, Registries, Vault, per-extension config
- Marketplace page with update badges
- Dynamic extension UI loading with Error Boundary isolation
- LAN access with 4-digit PIN auth (window.prompt), sleep prevention
- Scheduler dashboard: task list, manual trigger, execution history

**Phase 4: Extension SDK & Ecosystem**

- Published @renre-kit/extension-sdk with API client, shadcn/ui components, hooks
- create-renre-extension scaffolding tool
- GitHub registry with reference extensions (standard + MCP)
- SKILL.md convention, extended LLM context, capabilities command
- Dynamic scheduler registration via sdk.scheduler

### 14.2 Post-MVP Considerations

- Marketplace browsing during init
- Extension isolation: forked process or WASM sandbox
- Permission scopes in manifest with user approval
- Extension signature verification
- Dashboard theming and customization
- Extension dependency management
- OS keychain integration for vault encryption key
- HTTPS support for LAN mode
- Dashboard as native MCP client
