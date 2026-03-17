# ADR-006: Exact Version Pinning (Terraform-Style)

## Status
Accepted

## Context
Projects need predictable, reproducible extension versions. Two approaches:
1. **Semantic versioning ranges** (npm-style): `"figma": "^1.2.0"` allows patches and minor updates
2. **Exact pinning** (Terraform-style): `"figma": "1.2.0"` pins to specific version only

Semver ranges provide automatic updates but introduce nondeterminism: two developers with the same plugins.json may resolve to different versions. This complicates debugging and reproducibility.

## Decision
Use exact version pinning:
- `.renre-kit/plugins.json` specifies exact semantic versions:
  ```json
  {
    "figma": "1.2.0",
    "claude": "2.1.0",
    "my-tool": "0.5.3"
  }
  ```
- Multiple versions of the same extension coexist on disk:
  ```
  ~/.renre-kit/extensions/figma/
  ├── 1.0.0/
  ├── 1.1.0/
  ├── 1.2.0/    # Activated by project A
  └── 2.0.0/    # Activated by project B
  ```
- No version resolution logic: CLI loads the exact version specified
- Updates are explicit: `renre ext:update figma` updates the pinned version in plugins.json

## Consequences

### Positive
- Reproducibility: Same plugins.json always resolves to identical versions across machines
- Predictability: No surprise updates; versions only change when explicitly requested
- Simplicity: No version resolution algorithm; just string matching on disk
- Debuggability: Extension behavior is deterministic; bugs are consistent across runs
- Offline stability: No need to resolve versions online; stored versions are immutable

### Negative
- Manual updates required: Authors must explicitly run `ext:update` to get latest
- Disk usage: Multiple versions of the same extension stored simultaneously (mitigated by sharing common dependencies)
- Migration burden: Adding new extensions requires looking up latest version manually
- No security patches automatically: Patch versions require manual intervention (though could be mitigated by a security advisory system)

## Alternatives Considered
- **Semver ranges** (npm-style): `"figma": "^1.2.0"`. Automatic minor updates, but nondeterministic; makes debugging harder when different devs have different versions
- **Latest + lockfile** (hybrid): `plugins.json` specifies `"figma": "latest"`, `plugins.lock` pins to 1.2.0. Extra complexity for minimal benefit
- **Auto-update on interval**: Check for updates weekly and auto-pin new versions. Privacy concerns; uncontrolled environment changes

## Related Decisions
- ADR-001: Global Install, Local Activation (multiple versions stored in ~/.renre-kit/extensions/)
- ADR-003: Git-Based Registry (versions mapped to git tags)
- ADR-007: PR-Based Publishing (version tags published in registry)

## Future Considerations
- **Security advisory system**: Could implement notifications for critical patches without auto-updating
- **Version compatibility matrix**: Document which core versions work with which extension versions
- **Dependency locking**: If extensions have dependencies, extend to lock those too
