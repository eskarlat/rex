# ADR-009: Engine-Based Version Compatibility for Extensions

## Status

Accepted

## Context

Extensions depend on two things at different stages:

1. **`@renre-kit/extension-sdk`** at **build time** — UI components, hooks, API client, agent deployer
2. **`renre-kit` CLI core** at **runtime** — host APIs, lifecycle hooks, command registry, database schema

Today, extensions declare their own version but have no way to express "I need CLI >=0.2.0" or "I need SDK >=1.0.0". The core performs zero compatibility checks. This means:

- An extension built against SDK 2.0 can be installed on CLI 0.1 and silently fail
- A core upgrade can break installed extensions with no warning
- Extension authors cannot communicate minimum requirements to users
- ADR-006 (Exact Version Pinning) already flagged "version compatibility matrix" as future work

Known patterns in the ecosystem:

- **npm peer dependencies / VS Code `engines`**: Semver ranges (e.g., `"vscode": "^1.80.0"`)
- **Android API levels**: Monotonic integer (`minApiLevel: 21`)
- **Capability flags**: Feature-based (`requires: ["vault", "scheduler"]`)

## Decision

Add an `engines` field to the extension manifest with **minimum-version-only** constraints:

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "engines": {
    "renre-kit": ">=0.2.0",
    "extension-sdk": ">=1.0.0"
  }
}
```

### Rules

1. **Minimum only, no upper bound.** Extensions declare the oldest version they support. The semver contract is the implicit upper bound — only a **major version bump** in core or SDK signals potential breakage. This avoids forcing extension authors to publish updates on every minor/patch release.

2. **Both keys are optional.** If `engines` is omitted or a key is missing, no constraint is enforced for that dependency. This maintains backward compatibility with existing extensions.

3. **Constraint format is `>=X.Y.Z`.** A single minimum version, not a range. Simple to parse (string comparison after semver parse), simple to understand.

4. **Enforcement points:**
   - **Install time** (`ext:install`): Read the extension's `engines`, compare against the running CLI version and the SDK version bundled with it. On mismatch, warn and prompt for confirmation.
   - **Load time** (extension activation): Re-check on activation. Versions may have changed since install (e.g., CLI downgrade). On mismatch, warn in logs but still load (to avoid bricking projects).
   - **Scaffold time** (`create-renre-extension`): Stamp the current CLI and SDK versions as the `engines` defaults in generated manifests.

5. **Enforcement strictness evolves with maturity:**
   - **Pre-1.0** (current): **Warn** on incompatibility, allow install/activation to proceed. Log the mismatch clearly.
   - **Post-1.0**: **Error** on incompatibility at install time. Require `--force` flag to override. Load-time remains a warning to avoid bricking projects.

6. **Major version bump contract:** When `renre-kit` or `extension-sdk` ships a major version, extensions targeting the previous major are considered potentially incompatible. Extension authors should test and update their `engines` minimum if they want to support the new major.

### Manifest schema change

The Zod validation schema in the manifest loader adds:

```typescript
engines: z.object({
  'renre-kit': z.string().optional(),
  'extension-sdk': z.string().optional(),
}).optional();
```

### Validation logic (pseudo-code)

```typescript
function checkEngineCompat(
  manifest: ExtensionManifest,
  coreVersion: string,
  sdkVersion: string,
): CompatResult {
  const issues: string[] = [];

  if (manifest.engines?.['renre-kit']) {
    const minRequired = semver.minVersion(manifest.engines['renre-kit']);
    if (minRequired && semver.lt(coreVersion, minRequired)) {
      issues.push(`Requires renre-kit >=${minRequired}, running ${coreVersion}`);
    }
  }

  if (manifest.engines?.['extension-sdk']) {
    const minRequired = semver.minVersion(manifest.engines['extension-sdk']);
    if (minRequired && semver.lt(sdkVersion, minRequired)) {
      issues.push(`Requires extension-sdk >=${minRequired}, installed ${sdkVersion}`);
    }
  }

  return { compatible: issues.length === 0, issues };
}
```

## Consequences

### Positive

- **No churn for extension authors**: Minimum-only means no updates needed on every core release — only when the extension starts using newer APIs
- **Clear compatibility signal**: Users see immediately if an extension is too new for their CLI, before anything breaks
- **Familiar pattern**: `engines` field mirrors npm's `package.json` convention; Node developers already understand it
- **Backward compatible**: Existing extensions without `engines` continue to work unchanged
- **Simple implementation**: No semver range resolution — just a `>=` comparison against current versions
- **Scaffolding stamps defaults**: New extensions get correct `engines` values out of the box

### Negative

- **No protection against future breakage**: If core 2.0 breaks an extension that declared `>=1.0.0`, the constraint won't catch it (the extension technically said "any version from 1.0.0 onwards"). Mitigation: core publishes a migration guide on major bumps; extensions are expected to test and update.
- **Requires semver discipline**: The core team must follow semver strictly — breaking changes only in major bumps. If a minor release breaks extensions, the `engines` contract provides false safety.
- **New dependency**: Needs a semver parsing library (e.g., `semver` npm package) or a lightweight comparison utility.

## Alternatives Considered

- **Semver ranges with upper bound** (`"renre-kit": ">=0.2.0 <1.0.0"`): More precise but forces extension authors to release updates on every major core release, even if nothing actually broke. Creates update churn and "dependency hell" for a plugin ecosystem.
- **API level integer** (`minApiLevel: 3`): Simpler but conflates CLI and SDK versioning into one number. Doesn't map to the npm ecosystem conventions our authors already know.
- **Capability flags** (`requires: ["vault", "scheduler"]`): Feature-oriented but doesn't handle breaking changes within a capability. Better suited as a complementary mechanism in the future, not a replacement for version constraints.
- **No constraints, just documentation**: Status quo. Fails silently; documentation goes stale; users hit confusing runtime errors.

## Related Decisions

- ADR-006: Exact Version Pinning — controls which extension version a project uses; this ADR controls whether that version is compatible with the host
- ADR-008: Single Main Entry Point — `engines` is validated before lifecycle hooks from `main` are invoked
- ADR-002: Extension Types — applies to all three types (standard, MCP stdio, MCP SSE)
- ADR-003: Git-Based Registry — registry metadata could surface `engines` for pre-install compatibility checks

## Future Considerations

- **Registry-level filtering**: Registry search results could exclude extensions incompatible with the user's CLI version
- **Capability flags**: Complementary to `engines` — extensions could declare required host features (e.g., `requires: ["vault"]`) for more granular compatibility
- **Deprecation warnings**: Core could warn when an extension's `engines` minimum is close to the current version and a major bump is planned
- **Automated compatibility testing**: CI pipeline that tests registry extensions against upcoming core releases before publishing
