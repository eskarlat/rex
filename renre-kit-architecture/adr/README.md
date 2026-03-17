# Architecture Decision Records

This directory contains all Architecture Decision Records (ADRs) for the RenreKit CLI project, organized by topic area.

## Core

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](core/ADR-001-microkernel-architecture.md) | Microkernel (Plugin Architecture) pattern | Accepted |
| [ADR-002](core/ADR-002-sqlite-project-registry.md) | SQLite for project registry | Accepted |
| [ADR-003](core/ADR-003-technology-stack.md) | Node.js/TypeScript with Commander.js and @clack/prompts | Accepted |

## Extensions

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](extensions/ADR-001-global-install-local-activation.md) | Global install / local activation model | Accepted |
| [ADR-002](extensions/ADR-002-extension-types.md) | Three extension types (standard, MCP stdio, MCP SSE) | Accepted |
| [ADR-003](extensions/ADR-003-git-based-registry.md) | Git-based extension registry | Accepted |
| [ADR-004](extensions/ADR-004-dynamic-imports-vs-iframes.md) | Dynamic imports for extension UI panels | Accepted |
| [ADR-005](extensions/ADR-005-bundled-mcp-servers.md) | MCP servers bundled inside extensions | Accepted |
| [ADR-006](extensions/ADR-006-exact-version-pinning.md) | Exact version pinning (Terraform-style) | Accepted |
| [ADR-007](extensions/ADR-007-pr-based-publishing.md) | PR-based publishing workflow | Accepted |

## Vault

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](vault/ADR-001-central-vault-indirection.md) | Central vault with indirection mapping | Accepted |
| [ADR-002](vault/ADR-002-aes256-encryption.md) | AES-256-GCM encryption for secrets | Accepted |

## Dashboard

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](dashboard/ADR-001-localhost-web-dashboard.md) | Browser-based dashboard on localhost | Accepted |
| [ADR-002](dashboard/ADR-002-zero-business-logic.md) | Zero business logic (pure CLI proxy) | Accepted |
| [ADR-003](dashboard/ADR-003-pin-based-lan-auth.md) | 4-digit PIN for LAN authentication | Accepted |
| [ADR-004](dashboard/ADR-004-sleep-prevention.md) | Sleep prevention while dashboard runs | Accepted |
| [ADR-005](dashboard/ADR-005-settings-sub-sidebar.md) | Settings page with sub-sidebar navigation | Accepted |

## SDK

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](sdk/ADR-001-shadcn-ui-components.md) | shadcn/ui as shared component library | Accepted |
| [ADR-002](sdk/ADR-002-dynamic-scheduler-registration.md) | Dynamic scheduler registration via SDK | Accepted |

## LLM Skills

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](llm-skills/ADR-001-skill-md-convention.md) | SKILL.md convention for LLM skill definitions | Accepted |
| [ADR-002](llm-skills/ADR-002-two-layer-llm-context.md) | Two-layer LLM context provisioning | Accepted |

## Scheduler

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](scheduler/ADR-001-dynamic-vs-static-registration.md) | Dynamic task registration (not static manifest) | Accepted |
| [ADR-002](scheduler/ADR-002-sqlite-task-persistence.md) | SQLite persistence with rolling history | Accepted |

## Security

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](security/ADR-001-trusted-code-model.md) | Trusted code model for MVP | Accepted |
