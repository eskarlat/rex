# ADR-003: Git-Based Extension Registries

## Status

Accepted

## Context

Extensions are distributed via registries. The registry needs to:

- Support private/enterprise instances (GitHub Enterprise, GitLab, Gitea)
- Work offline (after initial clone)
- Avoid requiring new credentials (use existing dev credentials)
- Support fine-grained access control (who can publish)

Traditional package registries (npm, Python PyPI) require:

- Separate accounts and authentication tokens
- Central service availability
- Complex permission models

Enterprise users often run private Git instances and manage identity via SSH keys or SAML. Leveraging existing git credentials would improve security and UX.

## Decision

Registries are Git repositories containing an `extensions.json` file:

```json
{
  "figma": {
    "repository": "https://github.com/renre-kit/ext-figma",
    "versions": {
      "1.2.0": "v1.2.0",
      "1.1.0": "v1.1.0"
    }
  },
  "claude": {
    "repository": "git@github.com:anthropic/ext-claude.git",
    "versions": {
      "2.1.0": "v2.1.0"
    }
  }
}
```

The CLI:

1. Clones the registry repo locally
2. Reads `extensions.json` to discover available extensions and their git tags
3. Clones each extension's repository at the specified version tag
4. Validates the extension manifest before activation

Authentication uses existing git credentials (SSH keys, credential helpers, HTTPS tokens stored in .git-credentials).

## Consequences

### Positive

- Enterprise-friendly: Works with GitHub Enterprise, GitLab, Gitea, etc.
- No new credentials: Reuses existing SSH keys and git credential helpers
- Transparent access control: Git permissions map directly to who can publish
- Offline support: Clone once, use forever (with `git pull` to sync)
- Immutable versions: Git tags are immutable; no yanking or version re-releases

### Negative

- Requires git on the machine: Not all environments have git available
- Cloning overhead: First install requires two git clones (registry + extension)
- Large repos: Monorepo registries with many extensions clone slowly
- No semantic versioning: Versions must match git tags exactly; semver ranges require client-side resolution
- Discoverability: No web UI or search; users must know registry URLs

## Alternatives Considered

- **npm registry**: Standard package management, but requires npm account; not enterprise-friendly; npm doesn't support private instances well
- **HTTP API + token auth**: Flexible, but requires token management and an external service
- **GitHub Releases API**: GitHub-only; doesn't work with private instances or other platforms
- **Local file-based**: No versioning or distribution; requires manual installation

## Implementation

- **Registry clone location**: `~/.renre-kit/registries/default/` for the default registry
- **Registry configuration**: `.renre-kit/config.json` lists registry URLs:
  ```json
  {
    "registries": [
      "https://github.com/renre-kit/registry",
      "git@github.com:mycompany/private-registry.git"
    ]
  }
  ```
- **Git operations**: Use `simple-git` library for Node.js git integration

## Related Decisions

- ADR-001: Global Install, Local Activation (where extensions are stored)
- ADR-006: Exact Version Pinning (version matching in plugins.json)
- ADR-007: PR-Based Publishing (how extensions are added to registries)
