# ADR-001: Global Install, Per-Project Activation

## Status

Accepted

## Context

Extensions need to be:

- Available offline after installation
- Shared efficiently across projects (avoid duplication on disk)
- Isolated per-project (different projects may use different versions)
- Fast to activate without package manager overhead

Two approaches were considered:

1. **npm-style**: Install extensions per-project in `node_modules/` (like dependencies)
2. **Global + activation**: Install once globally, activate per-project via config

## Decision

Hybrid approach: Global install with per-project activation

- **Global install location**: `~/.renre-kit/extensions/` stores all downloaded extensions (e.g., `~/.renre-kit/extensions/figma/1.2.0/`)
- **Per-project activation**: `.renre-kit/plugins.json` in each project lists active extensions and their pinned versions
- **Runtime loading**: On startup, read `.renre-kit/plugins.json` and load only activated extensions from global store

Example `.renre-kit/plugins.json`:

```json
{
  "figma": "1.2.0",
  "claude": "2.1.0",
  "my-custom-tool": "0.5.3"
}
```

## Consequences

### Positive

- Disk efficiency: Shared extensions across projects; no duplication
- Offline support: After initial download, extensions work without internet
- Fast activation: No package installation step; just add entry to JSON
- Version isolation: Each project pins exact versions independently
- Familiar workflow: Similar to asdf, nvm, pyenv for runtime management

### Negative

- Shared state risk: Global extensions could have side effects affecting multiple projects
- Manual cleanup: Unused versions accumulate on disk; need explicit `ext:gc` command
- Fragility: If global extension is deleted, project activation breaks
- Migration complexity: Switching machines requires re-downloading extensions

## Alternatives Considered

- **Per-project install**: `project/.renre-kit/extensions/` mirrors npm node_modules. Simple, isolated, but wastes disk space (1 GB × 20 projects = 20 GB)
- **Cloud-only**: Extensions downloaded at runtime. No offline support; adds latency.
- **System-wide**: Install to `/opt/renre-kit/extensions/` (requires sudo, not portable)

## Related Decisions

- ADR-006: Exact Version Pinning (how versions are specified in plugins.json)
- ADR-003: Git-Based Registry (where extensions are downloaded from)
