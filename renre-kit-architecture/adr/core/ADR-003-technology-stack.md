# ADR-003: Technology Stack (Node.js, TypeScript, Commander.js, @clack/prompts)

## Status

Accepted

## Context

The CLI needs:

- Robust argument parsing and command routing
- Modern, responsive interactive prompts (spinners, selects, multiselects)
- Type safety and excellent developer experience for extension authors
- Cross-platform support (macOS, Linux, Windows)

The Node.js ecosystem is mature for CLI tooling and familiar to the target audience (web developers, designers).

## Decision

Build renre-kit using:

- **Node.js + TypeScript**: Type safety, familiar syntax for web developers, excellent tooling
- **Commander.js**: Lightweight, unopinionated CLI framework for argument parsing and command routing
- **@clack/prompts**: Modern interactive prompt library with animated spinners, selects, and multiselects

## Consequences

### Positive

- Developer familiarity: Node.js and TypeScript are standard in the web development community
- CLI maturity: Commander.js is battle-tested in thousands of projects (e.g., nx, vue-cli)
- Modern UX: @clack/prompts provides beautiful, responsive prompts with good visual feedback
- No external service: CLI runs entirely locally; no cloud dependency
- Cross-platform: Node.js runtime works on macOS, Linux, Windows

### Negative

- Node.js startup overhead: Every invocation must boot the Node.js runtime (~100–200ms on modern machines)
- Binary size: Bundled Node.js adds 50+ MB to standalone distributions
- Dependency supply chain: Reliance on npm ecosystem; vulnerability disclosure lags behind systems languages
- @clack/prompts immaturity: Newer library compared to inquirer.js; less battle-tested in production

### Tradeoffs

- **Faster startup**: Could rewrite in Rust (e.g., Tauri CLI framework), but development velocity would suffer
- **Lighter footprint**: Could use Go, but reduces extensibility in JavaScript/TypeScript

## Alternatives Considered

- **Ink.js**: React-based CLI, but overkill for non-interactive commands
- **oclif**: Opinionated, heavyweight; ties CLI to their plugin system
- **Inquirer.js**: More mature, but older API; @clack/prompts has better UX

## Related Decisions

- ADR-001: Microkernel Architecture (Commander.js for routing)
- ADR-005: Extensions use same tech stack for consistency
