<p align="center">
  <img src="assets/logo-full.svg" alt="RenreKit" width="600" />
</p>

<p align="center">
  <strong>A lightweight, plugin-driven development CLI that gets out of your way.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#what-is-renrekit">What Is It?</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#web-dashboard">Dashboard</a> &bull;
  <a href="#building-extensions">Extensions</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node.js >= 20" />
  <img src="https://img.shields.io/badge/pnpm-9.15.4-orange" alt="pnpm 9.15.4" />
  <img src="https://img.shields.io/badge/coverage-86%25-blue" alt="Coverage 86%" />
  <img src="https://img.shields.io/badge/license-MIT-purple" alt="MIT License" />
</p>

---

## What Is RenreKit?

RenreKit is a **microkernel CLI** — a tiny core that does very little on its own, but becomes powerful through **extensions**. Think of it like VS Code, but for your terminal and AI workflows.

The core handles three things:
1. **Discovering** extensions
2. **Loading** them
3. **Routing** commands to them

Everything else — every feature, every command, every UI panel — comes from extensions.

Each extension can plug into **three interaction modes**:

| Mode | What it does |
|------|-------------|
| **CLI commands** | Terminal commands you can run from anywhere |
| **Dashboard panels** | Visual UI in the web dashboard |
| **LLM skills** | SKILL.md files that teach AI agents new capabilities |

## Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **pnpm** 9.15.4

### Install

> **Coming soon** — `npm i -g @renre-kit/cli`

### Local Development

```bash
# Clone the repo
git clone https://github.com/eskarlat/rex.git
cd rex

# Install dependencies
pnpm install

# Build everything
pnpm build

# Link the CLI globally
pnpm --filter @renre-kit/cli link --global

# Initialize a project
renre-kit init

# Add an extension
renre-kit ext:add hello-world

# Launch the web dashboard
renre-kit ui
```

That's it. You now have a working project with an extension and a dashboard.

## Features

### Project Management

Every project gets its own `.renre-kit/` directory with a manifest, version-pinned plugins, and scoped storage. Global state lives in `~/.renre-kit/`.

```bash
renre-kit init          # Set up a new project
renre-kit destroy       # Remove project config
```

### Extension Management

Extensions are first-class citizens. Install them from registries, activate per-project, configure individually, and keep them updated.

```bash
renre-kit ext:add <name>        # Install an extension
renre-kit ext:remove <name>     # Uninstall
renre-kit ext:list              # See what's installed
renre-kit ext:activate <name>   # Turn on for current project
renre-kit ext:deactivate <name> # Turn off
renre-kit ext:config <name>     # Configure
renre-kit ext:status <name>     # Health check
renre-kit ext:outdated          # Check for updates
renre-kit ext:update <name>     # Update to latest
```

### Three Flavors of Extensions

| Type | How it works | Best for |
|------|-------------|----------|
| **Standard** | Loaded in-process via `require()` | Simple tools, fast execution |
| **MCP stdio** | Spawned as a child process, talks JSON-RPC | Isolated tools, language-agnostic |
| **MCP SSE** | Remote HTTP server | Shared services, always-on tools |

MCP connections are managed automatically — lazy start, 30-second idle timeout, exponential backoff on failures (up to 3 retries).

### Encrypted Vault

Secrets are stored locally with **AES-256-GCM** encryption. Extensions can reference vault entries in their config, and values get decrypted transparently at runtime.

```bash
renre-kit vault:set API_KEY       # Store a secret
renre-kit vault:list              # See stored keys
renre-kit vault:remove API_KEY    # Delete a secret
```

### Configuration

Config resolution follows a clear chain:

```
Project override (.renre-kit/manifest.json)
  → Global config (~/.renre-kit/config.json)
    → Schema defaults
```

Vault-mapped fields are decrypted automatically — just reference `vault:KEY_NAME` in your config.

### Git-Based Registries

Extension registries are plain git repos. Point RenreKit at one (or many), and it syncs the catalog locally.

```bash
renre-kit registry:sync          # Pull latest from all registries
renre-kit registry:list          # Browse available extensions
```

### Scheduler

Extensions can register cron-based tasks. The scheduler runs inside the dashboard server and tracks execution history.

```bash
renre-kit scheduler:list         # View scheduled tasks
renre-kit scheduler:trigger      # Run a task manually
```

### LLM Skills

Extensions can ship `SKILL.md` files — structured documents that teach AI agents what the extension can do and how to use it. When you activate an extension, its skills get deployed to `.agents/skills/` in your project.

```bash
renre-kit capabilities           # Aggregate all active LLM skills
```

## Web Dashboard

Launch the dashboard with `renre-kit ui` and get a full visual interface for everything.

```bash
renre-kit ui                     # Open dashboard (default port 4200)
renre-kit ui --port 8080         # Custom port
renre-kit ui --lan               # Enable LAN access (PIN-protected)
renre-kit ui --no-browser        # Don't auto-open browser
```

### What's in the Dashboard

- **Projects** — Switch between projects, see status at a glance
- **Marketplace** — Browse, install, and manage extensions visually
- **Vault** — Manage secrets through a friendly UI
- **Scheduler** — View tasks, execution history, trigger runs
- **Settings** — Global config, registries, vault settings, per-extension config
- **Extension Panels** — Each extension can contribute its own UI panels and widgets
- **Live Logs** — Real-time log streaming via WebSocket

LAN mode adds a 4-digit PIN authentication layer so you can access the dashboard from other devices on your network.

## Monorepo Structure

The project is organized as a **Turborepo + pnpm** monorepo:

```
rex/
├── packages/
│   ├── cli/                    # Core CLI — the brain
│   ├── server/                 # Dashboard API (Fastify)
│   ├── ui/                     # Dashboard SPA (React 19)
│   ├── extension-sdk/          # SDK for extension authors
│   └── create-renre-extension/ # Scaffolding tool
├── extensions/
│   └── hello-world/            # Reference: standard extension
└── renre-kit-architecture/     # Architecture docs & ADRs
```

### Build Order

```
extension-sdk (no deps)
    ↓
cli + ui (parallel, both depend on extension-sdk)
    ↓
server (depends on cli)
```

### Package Responsibilities

**@renre-kit/cli** — The heart of the system. Handles project lifecycle, extension loading, command routing, database, vault, config, and registry management. Exposes two entry points: one for the CLI binary, one as a library for the server.

**@renre-kit/server** — A thin Fastify layer with **zero business logic**. Every endpoint imports a CLI manager and calls it directly. Think of it as a REST adapter over the CLI.

**@renre-kit/ui** — React 19 SPA built with Vite, Tailwind CSS, and shadcn/ui. Talks to the server via React Query. Supports dynamic loading of extension UI panels.

**@renre-kit/extension-sdk** — Everything extension authors need:
- `.` — API client and React hooks
- `./components` — Shared shadcn/ui components
- `./node` — Node utilities (`deployAgentAssets`, `cleanupAgentAssets`, `buildPanel`)

**create-renre-extension** — Run it to scaffold a new extension with all the boilerplate.

## File System Layout

### Global (`~/.renre-kit/`)

| Path | Purpose |
|------|---------|
| `db.sqlite` | Project registry (SQLite) |
| `extensions/{name}@{version}/` | Installed extension packages |
| `registries/{name}/` | Cloned registry repos |
| `vault.json` | Encrypted secrets |
| `config.json` | Global settings |
| `logs/` | Rotating daily logs |

### Per-Project (`.renre-kit/`)

| Path | Purpose |
|------|---------|
| `manifest.json` | Project metadata |
| `plugins.json` | Activated extensions with pinned versions |
| `storage/` | Extension-scoped key/value storage |

### LLM Assets (`.agents/`)

| Path | Purpose |
|------|---------|
| `skills/{name}/SKILL.md` | Skill definitions for AI agents |
| `prompts/` | Prompt templates |
| `context/` | Context documents |
| `agents/` | Agent configurations |
| `workflows/` | Workflow definitions |

## Building Extensions

Creating an extension is straightforward:

```bash
npx create-renre-extension my-extension
```

This scaffolds a project with:
- A `manifest.json` describing your extension
- A `main` entry point with `onInit` / `onDestroy` lifecycle hooks
- Optional UI panel (React component bundled with esbuild)
- Optional agent assets (SKILL.md, prompts, context)

### Extension Manifest

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "type": "standard",
  "main": "dist/index.js",
  "commands": [
    {
      "name": "do-thing",
      "description": "Does the thing"
    }
  ],
  "panels": [
    {
      "id": "main",
      "title": "My Panel",
      "entry": "dist/panel.js"
    }
  ],
  "configSchema": {
    "apiKey": {
      "type": "string",
      "secret": true
    }
  }
}
```

### Lifecycle Hooks

Extensions export `onInit` and `onDestroy` to handle setup and teardown — deploying agent assets, registering scheduled tasks, etc.

```typescript
export async function onInit(context: ExtensionContext): Promise<void> {
  await deployAgentAssets(context);
}

export async function onDestroy(context: ExtensionContext): Promise<void> {
  await cleanupAgentAssets(context);
}
```

Check out the [Extension Development Guide](docs/extension-development.md) and the reference extensions in `extensions/` for complete examples.

## Development

### Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build everything (Turborepo handles ordering)
pnpm dev                  # Watch mode for all packages

pnpm test                 # Run unit tests (Vitest)
pnpm test:coverage        # Tests with 86% coverage enforcement
pnpm test:e2e             # Playwright E2E tests
pnpm test:cli             # CLI integration tests

pnpm lint                 # ESLint
pnpm lint:deadcode        # Dead code detection (Knip)
pnpm lint:duplication     # Code duplication check (jscpd)
pnpm typecheck            # TypeScript type checking
pnpm format               # Prettier formatting

pnpm validate             # Run ALL quality gates at once
```

### Per-Package

```bash
pnpm --filter @renre-kit/cli test               # Test just the CLI
pnpm --filter @renre-kit/ui dev                  # UI dev server (port 4201)
pnpm --filter @renre-kit/server dev              # Server dev (port 4200)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI framework | Commander.js |
| Database | SQLite (better-sqlite3) |
| Interactive prompts | clack |
| Schema validation | Zod |
| Git operations | simple-git |
| Logging | Pino |
| API server | Fastify |
| Frontend | React 19 |
| Build (UI) | Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix) |
| Data fetching | React Query |
| Forms | React Hook Form |
| Monorepo | Turborepo |
| Testing | Vitest + Playwright |
| Coverage | Istanbul |

### Quality Standards

These are enforced, not aspirational:

- **86% test coverage** minimum (statements, branches, functions, lines)
- **No `any` types** — use `unknown` + type narrowing
- **Cyclomatic complexity** max 10
- **Cognitive complexity** max 15
- **Code duplication** threshold 5 (jscpd)
- **ESM throughout** with `.js` import extensions
- **Prettier** — 100 char width, single quotes, trailing commas, semicolons

## Architecture

The full architecture specification lives in [`renre-kit-architecture/README.md`](renre-kit-architecture/README.md) (14 sections). Key decisions are documented in ~25 ADRs covering core, extensions, vault, dashboard, SDK, LLM skills, scheduler, and security.

### Database

SQLite with 4 tables: `projects`, `installed_extensions`, `scheduled_tasks`, `task_history`. Schema and ER diagram in [`renre-kit-architecture/diagrams/`](renre-kit-architecture/diagrams/).

### Data Flow

```
User Input → Commander.js → Command Registry → Handler → Output
                                  ↑
                            Extensions register
                            their commands here
```

Dashboard flow:

```
Browser → React UI → React Query → Fastify API → CLI Managers → SQLite/Filesystem
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `RENRE_KIT_HOME` | Override global directory | `~/.renre-kit` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code standards, testing guidelines, and how to create extensions.

## License

MIT
