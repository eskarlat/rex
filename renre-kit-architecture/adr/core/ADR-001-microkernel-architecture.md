# ADR-001: Microkernel (Plugin Architecture) Pattern

## Status
Accepted

## Context
The CLI needs to remain lightweight and fast while supporting unlimited functionality across diverse use cases (Figma, Claude, design systems, etc.). A monolithic architecture would bloat the core binary and slow startup times. A truly distributed system would be overly complex for a CLI tool.

## Decision
Adopt the Microkernel (Plugin Architecture) pattern:
- **Thin core**: Handles only essential concerns: extension discovery, loading, routing, and core CLI infrastructure
- **Extensions as plugins**: All domain-specific features (Figma integration, Claude API, design system tools) live in separate extension modules
- **Unified command registry**: All commands, regardless of source, appear as first-class CLI commands

## Consequences

### Positive
- Fast startup: Only the core loads on every invocation; extensions load on-demand
- Small footprint: Users pay for only the extensions they install
- Unlimited extensibility: New domains can be added without modifying core
- Clean separation of concerns: Core stability isolated from extension volatility

### Negative
- Extensions must follow strict interface contracts: Breaking changes to core contracts require coordination
- Discovery complexity: Extensions need a way to register commands at runtime
- Testing burden: Core changes require regression testing against installed extensions
- Versioning: Need to manage compatibility between core versions and extension versions

## Related Decisions
- ADR-002: SQLite Project Registry (how extensions are activated per-project)
- ADR-003: Technology Stack (Commander.js for routing)
