# ADR-007: PR-Based Publishing Workflow for Extension Registries

## Status

Accepted

## Context

Extension registries (git repos with `extensions.json`) need a publishing mechanism. Options:

1. **Self-service push**: Authors push directly to main branch
2. **PR-based review**: Authors submit PRs; CI validates; maintainers merge
3. **Central service**: Separate publish API (like npm publish)

Direct push is fast but error-prone. A central service adds infrastructure. PR-based workflow leverages existing git workflows and provides a review checkpoint.

## Decision

Use pull request workflow for publishing extensions:

- Authors fork the registry repo
- Add or update entry in `extensions.json`:
  ```json
  {
    "my-extension": {
      "repository": "https://github.com/author/renre-ext-my-extension",
      "versions": {
        "1.0.0": "v1.0.0"
      }
    }
  }
  ```
- Commit, push to feature branch, open PR
- CI automatically validates:
  - Git repository URL is accessible
  - Git tag (e.g., `v1.0.0`) exists and is signed/annotated
  - Extension manifest.json exists at tag
  - Manifest fields are valid (name, version, type, etc.)
- Maintainers review PR and merge on approval
- Merged extensions immediately available in registry

## Consequences

### Positive

- Familiar workflow: Git-based workflow matches development practices
- Review checkpoint: Community and maintainers can comment on new extensions before publishing
- CI quality gates: Automated validation prevents invalid entries
- Decentralized publishing: No separate publish service; leverages git infrastructure
- Audit trail: PR history and commit signatures provide transparency
- Spam prevention: PR-based flow filters low-quality extensions

### Negative

- Slower publishing: Authors wait for maintainer review (hours to days)
- Maintainer burden: Maintainers must review every submission
- Publishing friction: Higher barrier to entry for new extension authors
- Rate limits: GitHub API rate limits could affect large registries
- Scaling issues: Single registry maintainer becomes bottleneck at scale

## Alternatives Considered

- **Self-service push** (fast): `git push origin main` on registry. Fast, but no validation; risk of broken entries
- **Central service** (e.g., `renre ext:publish`): Requires auth token, external service, permission management. Complex to implement; adds attack surface
- **Automated sync from npm**: Periodically pull from npm registry and auto-add. Loses community review; complexity of npm versioning

## Implementation

- **CI workflow** (GitHub Actions):
  ```yaml
  on: [pull_request]
  jobs:
    validate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Validate extensions.json
          run: |
            node scripts/validate-registry.js
            # Check git URLs accessibility
            # Verify tags exist
            # Validate manifests
        - name: Comment with results
          uses: actions/github-script@v6
          if: failure()
          with:
            script: |
              github.rest.issues.createComment(...)
  ```
- **Validation script** checks:
  - JSON syntax of extensions.json
  - Git URL format and accessibility
  - Git tag existence (fetch --dry-run)
  - Extension manifest.json structure
  - Semantic versioning format

## Future Enhancements

- **Auto-publish for verified authors**: Whitelist trusted authors to skip review
- **Scheduled sync**: Periodically verify all extension tags still exist
- **Deprecation workflow**: Support marking extensions as deprecated in registry
- **Multi-maintainer model**: Split registries by domain (design extensions, AI extensions, etc.)

## Related Decisions

- ADR-003: Git-Based Registry (how registries are structured)
- ADR-006: Exact Version Pinning (versions published as git tags)
