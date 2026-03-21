# Architecture Decision Records

RenreKit maintains ~25 ADRs (Architecture Decision Records) documenting key design decisions. These explain not just *what* was decided, but *why* — and what alternatives were considered.

ADRs live in `renre-kit-architecture/adr/` in the repository.

## Core

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Microkernel architecture | Extensibility, stable core, independent development |
| **ADR-002** | SQLite project registry | Zero infrastructure, synchronous API, single-file portability |
| **ADR-003** | Technology stack | Node.js + TypeScript + pnpm + Turborepo ecosystem |
| **ADR-004** | Schema versioning & migration | Numbered SQL files, automatic application |
| **ADR-005** | Build-time version constants | Inject version at build time, not runtime |
| **ADR-006** | Resilient database migrations | Idempotent, crash-safe, forward-only |
| **ADR-007** | Doctor diagnostic command | Self-service health checks for troubleshooting |

## Extensions

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Global install, local activation | Avoid package duplication, per-project control |
| **ADR-002** | Three extension types | Standard, MCP stdio, MCP SSE — different trade-offs |
| **ADR-003** | Git-based registry | No custom infrastructure, works with existing git hosting |
| **ADR-004** | Dynamic imports vs iframes | Dynamic imports for performance, no iframe security overhead |
| **ADR-005** | Bundled MCP servers | Ship common MCP servers, reduce user setup |
| **ADR-006** | Exact version pinning | Reproducibility, no surprise breaking changes |
| **ADR-007** | PR-based publishing | Code review for registry additions |
| **ADR-008** | Single main entry point | Simplicity — one file for lifecycle hooks |
| **ADR-009** | Engine version compatibility | Semver ranges for core/SDK compatibility |
| **ADR-010** | Mandatory engine constraints | Prevent incompatible extensions from installing |

## Dashboard

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Localhost web dashboard | Visual interface without cloud dependency |
| **ADR-002** | Zero business logic | Server is a thin REST adapter, CLI is truth |
| **ADR-003** | PIN-based LAN auth | Simple security for local network access |
| **ADR-004** | Sleep prevention | Keep the server alive when dashboard is open |
| **ADR-005** | Settings sub-sidebar | Organized settings navigation |
| **ADR-006** | Extension widget dashboard | Customizable grid with extension-contributed widgets |

## Vault

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Central vault indirection | Extensions reference vault keys, not raw secrets |
| **ADR-002** | AES-256-GCM encryption | Industry-standard authenticated encryption |

## SDK

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | shadcn/ui components | Consistent UI, copy-paste customizable, Radix accessibility |
| **ADR-002** | Dynamic scheduler registration | Extensions register tasks at runtime via SDK hooks |

## LLM Skills

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | SKILL.md convention | Structured Markdown that AI tools can parse |
| **ADR-002** | Two-layer LLM context | Skills (how-to) + Context (reference) separation |

## Scheduler

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Dynamic vs static registration | Dynamic — extensions register at activation time |
| **ADR-002** | SQLite task persistence | Reuse existing database, survive restarts |

## Security

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| **ADR-001** | Trusted code model | No sandboxing — extensions run as the user. Simple, pragmatic. |

::: tip Reading ADRs
Each ADR follows a standard format: **Context** (why we needed a decision), **Decision** (what we chose), **Consequences** (what follows from the choice), and **Alternatives** (what we didn't pick and why). They're designed to be readable by anyone joining the project.
:::
