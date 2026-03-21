# Development Setup

Want to contribute to RenreKit? This page gets your local development environment ready.

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** 9.15.4

::: tip pnpm version
The exact pnpm version is pinned via the `packageManager` field in the root `package.json`. If you have a different version, pnpm's corepack integration handles it automatically.
:::

## Clone & Install

```bash
git clone https://github.com/eskarlat/rex.git
cd rex
pnpm install
```

## Build Everything

```bash
pnpm build
```

Turborepo handles the dependency order: `extension-sdk` → `cli` + `ui` (parallel) → `server`.

## Development Mode

```bash
# Watch mode for all packages
pnpm dev
```

Or run specific packages:

```bash
# UI dev server (port 4201, proxies /api to 4200)
pnpm --filter @renre-kit/ui dev

# API server (port 4200)
pnpm --filter @renre-kit/server dev

# Both together — start server first, then UI
pnpm --filter @renre-kit/server dev &
pnpm --filter @renre-kit/ui dev
```

## Link the CLI Globally

To test CLI commands directly:

```bash
pnpm --filter @renre-kit/cli link --global
renre-kit --version
```

## Running Tests

```bash
# All unit tests
pnpm test

# Single package
pnpm --filter @renre-kit/cli test

# Single test file
pnpm --filter @renre-kit/cli test -- src/core/database/database.test.ts

# With coverage
pnpm test:coverage

# E2E tests (needs a running server)
pnpm test:e2e

# CLI integration tests
pnpm test:cli
```

## Quality Gates

Run all validations at once:

```bash
pnpm validate
```

This runs (via Turborepo):
1. `pnpm lint` — ESLint
2. `pnpm typecheck` — TypeScript type checking
3. `pnpm test:coverage` — Tests with 86% coverage threshold
4. `pnpm lint:duplication` — Code duplication check
5. `pnpm lint:deadcode` — Dead code detection (Knip)

All must pass before merging.

## Formatting

```bash
# Format all files
pnpm format

# Check formatting without writing
pnpm format:check
```

Prettier config: 100 char line width, single quotes, trailing commas, semicolons, 2-space indent.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `RENRE_KIT_HOME` | Override global directory | `~/.renre-kit` |

Useful for running tests against an isolated environment.

## Project Structure

```
rex/
├── packages/
│   ├── cli/                      # Core CLI
│   ├── server/                   # Dashboard API
│   ├── ui/                       # Dashboard UI
│   ├── extension-sdk/            # SDK for extensions
│   └── create-renre-extension/   # Scaffolding tool
├── extensions/                   # Reference extensions
├── renre-kit-architecture/       # Architecture docs & ADRs
├── doc/                          # Documentation site
├── turbo.json                    # Turborepo config
├── vitest.workspace.ts           # Vitest workspace config
├── vitest.shared.ts              # Shared test settings
└── .eslintrc.cjs                 # ESLint config
```

Each package follows the same internal structure:

```
src/
├── core/        # Infrastructure (database, logger, types)
├── features/    # Domain modules (extensions, registry, vault)
└── shared/      # Cross-cutting utilities
```
