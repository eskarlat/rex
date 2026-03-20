# Contributing to RenreKit

Thank you for your interest in contributing to RenreKit! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/example-org/renre-kit.git
cd rex

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** 9.15.4 (managed via `packageManager` field)

## Monorepo Structure

| Package | Path | Purpose |
|---------|------|---------|
| `@renre-kit/cli` | `packages/cli/` | Core CLI: commands, extensions, registry, database |
| `@renre-kit/server` | `packages/server/` | Dashboard REST API (Fastify) |
| `@renre-kit/ui` | `packages/ui/` | Web dashboard SPA (React 19, Vite) |
| `@renre-kit/extension-sdk` | `packages/extension-sdk/` | SDK for extension authors |
| `create-renre-extension` | `packages/create-renre-extension/` | Extension scaffolding tool |

Build order: `extension-sdk` first, then `cli` + `ui` in parallel, then `server`.

## Development Workflow

### Running in Development

```bash
pnpm dev                           # Watch mode for all packages
pnpm --filter @renre-kit/ui dev    # UI dev server (port 4201)
pnpm --filter @renre-kit/server dev # API server (port 4200)
```

### Testing

```bash
pnpm test                # All unit tests (Vitest)
pnpm test:e2e            # Playwright e2e tests
pnpm test:cli            # MJS CLI integration tests
pnpm test:coverage       # Coverage with 86% threshold
```

### Quality Gates

All of these must pass before merging:

```bash
pnpm validate            # Runs lint + typecheck + coverage + duplication
```

## Code Standards

### TypeScript

- ESM throughout — use `.js` extension in imports
- `import type` for type-only imports
- `noUncheckedIndexedAccess: true` — always handle `undefined` from indexing
- No `any` types — use `unknown` + type narrowing

### Quality Rules

- **Cyclomatic complexity**: max 10
- **Cognitive complexity**: max 15
- **Test coverage**: 86% minimum (statements, branches, functions, lines)
- **Code duplication**: jscpd threshold 5

### Testing

- TDD: write tests first (`*.test.ts` co-located with source)
- CLI/server tests: `environment: 'node'`
- UI/SDK tests: `environment: 'jsdom'`

## Creating Extensions

Use the scaffolding tool:

```bash
npx create-renre-extension my-extension
```

Or see the reference extension in `extensions/` for an example:
- `hello-world` — Standard in-process extension

### Extension Registry

The local registry at `registry/extensions.json` lists the reference extensions. To add a new extension to the registry, submit a PR that:

1. Adds the extension to `extensions/` (or as an external git repo)
2. Adds an entry to `registry/extensions.json`
3. Tags the extension with a semver git tag (e.g., `v1.0.0`)

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes following the code standards above
3. Ensure `pnpm validate` passes
4. Write or update tests for your changes
5. Submit a pull request with a clear description

## Reporting Issues

Open an issue at https://github.com/example-org/renre-kit/issues with:
- Steps to reproduce
- Expected vs actual behavior
- Node.js and OS version
