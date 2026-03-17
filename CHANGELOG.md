# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `renre-kit ui` command to start the web dashboard from CLI
  - Supports `--port`, `--lan`, `--no-browser`, `--no-sleep` flags
  - Spawns Fastify server and optionally opens browser
- Local extension registry at `registry/extensions.json` with reference extensions
- Playwright e2e test suite (33 tests) with real server integration
- MJS CLI integration tests (43 tests) covering all commands
- CONTRIBUTING.md with development setup and code standards
- CODEOWNERS for GitHub code review assignment

### Fixed
- Database migration path resolution in bundled builds (tsup)
- `cron-parser` CJS/ESM interop — replaced with `croner` (ESM-native)
- `extension-sdk` DTS generation for `node:fs`/`node:path` imports

## [0.0.1] - 2026-03-17

### Added
- **Phase 1 — Core CLI & Extensions**
  - Project lifecycle (`init`, `destroy`)
  - Extension management (add, remove, list, activate, deactivate, config, status, restart)
  - Command registry with namespaced routing
  - MCP support (stdio and SSE transports)
  - Git-based extension registries (sync, list, resolve)
  - SQLite database with migrations

- **Phase 2 — Vault, Configuration & Versioning**
  - AES-256-GCM encrypted vault (set, list, remove)
  - Global config with vault-mapped field resolution
  - Extension version pinning, outdated checks, and updates

- **Phase 3 — Web Dashboard**
  - Fastify REST API (32 endpoints) with WebSocket log streaming
  - React 19 SPA with shadcn/ui components
  - Marketplace, vault, scheduler, and settings pages
  - LAN mode with PIN authentication
  - Scheduler with cron-based task execution

- **Phase 4 — Extension SDK & Ecosystem**
  - Published SDK with API client, React hooks, and shared components
  - `create-renre-extension` scaffolding tool
  - Reference extensions: `hello-world` (standard), `echo-mcp` (MCP stdio)
  - SKILL.md convention for LLM skill definitions
