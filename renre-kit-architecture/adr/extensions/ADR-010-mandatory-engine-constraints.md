# ADR-010: Mandatory Engine Constraints

## Status

Proposed (supersedes optionality in ADR-009)

## Context

ADR-009 introduced the `engines` field in extension manifests for version compatibility checks. Both `engines` itself and its sub-keys (`renre-kit`, `extension-sdk`) were made **optional** to maintain backward compatibility with existing extensions.

Since then, the project's position has changed:

- **Pre-publish**: There are no third-party extensions in the wild. The only reference extension (`hello-world`) is in the repo. There is no backward compatibility concern.
- **Scaffolding already stamps engines**: `create-renre-extension` generates manifests with `engines` populated from the current CLI and SDK versions. New extensions already have the field.
- **Optional engines undermine compatibility checks**: If `engines` is missing, `checkEngineCompat()` returns early with "compatible" — meaning the entire engine checking system can be silently bypassed by omitting a field. This defeats the purpose of ADR-009.
- **ADR-005** (build-time version constants) will make accurate version values available. The scaffolding tool can stamp real versions instead of hardcoded strings.

The pre-publish window is the right time to make this a hard requirement. Doing it after publish would be a breaking change for the extension ecosystem.

## Decision

### 1. Make `engines` and both sub-keys required in the Zod schema

```typescript
// Before (ADR-009):
engines: z.object({
  'renre-kit': z.string().optional(),
  'extension-sdk': z.string().optional(),
}).optional();

// After:
engines: z.object({
  'renre-kit': z.string(),
  'extension-sdk': z.string(),
});
```

### 2. Update the TypeScript interface

```typescript
// Before:
interface EngineConstraints {
  'renre-kit'?: string;
  'extension-sdk'?: string;
}

interface ExtensionManifest {
  // ...
  engines?: EngineConstraints;
}

// After:
interface EngineConstraints {
  'renre-kit': string;
  'extension-sdk': string;
}

interface ExtensionManifest {
  // ...
  engines: EngineConstraints;
}
```

### 3. Remove the early return in `checkEngineCompat()`

```typescript
// Before:
function checkEngineCompat(manifest: ExtensionManifest, ...): CompatResult {
  if (!manifest.engines) return { compatible: true, issues: [] };
  // ...optional chaining for each key
}

// After:
function checkEngineCompat(manifest: ExtensionManifest, ...): CompatResult {
  const issues: string[] = [];

  const minCli = semver.minVersion(manifest.engines['renre-kit']);
  if (minCli && semver.lt(coreVersion, minCli)) {
    issues.push(`Requires renre-kit >=${minCli}, running ${coreVersion}`);
  }

  const minSdk = semver.minVersion(manifest.engines['extension-sdk']);
  if (minSdk && semver.lt(sdkVersion, minSdk)) {
    issues.push(`Requires extension-sdk >=${minSdk}, installed ${sdkVersion}`);
  }

  return { compatible: issues.length === 0, issues };
}
```

### 4. Hard-fail at install and activate

ADR-009 specified warn-only enforcement pre-1.0. Since engines are now mandatory and always present, incompatibility is a hard error at both **install** (`ext:add`) and **activate** (`ext:activate`):

- Install: Abort with error message listing incompatibilities. No `--force` override — the extension simply cannot run on this CLI version.
- Activate: Abort with error message. The extension remains installed but inactive.

This is safe because the constraints are minimum-only (`>=`). An extension declaring `"renre-kit": ">=0.1.0"` will work on any CLI version ≥ 0.1.0. Hard-fail only triggers when the running CLI is genuinely too old.

### 5. Update reference extensions

The `hello-world` manifest already has `engines`. Verify it includes both required keys with valid semver constraints.

### 6. Follow-up: Real versions in scaffolding

After ADR-005 (build-time version constants) is implemented, update `create-renre-extension` to read the real CLI and SDK versions instead of hardcoded strings when stamping `engines` in generated manifests.

## Consequences

### Positive

- **No silent compatibility bypass**: Every extension must declare what it needs. The compatibility check always runs with real data.
- **Cleaner code**: No optional chaining, no early returns, no "engines might be undefined" branches. The types enforce presence.
- **Zero migration cost**: No third-party extensions exist yet. The reference extension already has the field.
- **Stronger guarantees for `renre doctor`** (ADR-007): The doctor command can rely on `engines` being present without null-checking.
- **Better error messages**: Instead of "no engines field, skipping check", users get definitive pass/fail results.

### Negative

- **Strictness for extension authors**: Every extension must declare engine constraints, even if the author doesn't care about version compatibility. Mitigation: scaffolding stamps defaults, so authors get valid values without manual effort.
- **Supersedes part of ADR-009**: Changes the optionality decision made in ADR-009. The ADR trail must be clear about this evolution.
- **No escape hatch**: Unlike ADR-009's `--force` flag concept, incompatibility is a hard stop. This is intentional for pre-1.0 but may need revisiting if edge cases arise post-publish.

## Alternatives Considered

- **Keep optional, add lint warning**: A lint rule could warn about missing `engines` in registries. But this is advisory — extensions can still ship without it and bypass compatibility checks at runtime.
- **Required in registry, optional locally**: Only enforce `engines` when publishing to a registry, allow local development without it. Adds complexity with two validation modes. Since scaffolding stamps it automatically, there's no real burden in requiring it everywhere.
- **Wait until post-1.0**: Make it required only after a stable release. But post-1.0 it becomes a breaking change for the extension ecosystem. The pre-publish window is the cheapest time to enforce this.

## Related Decisions

- extensions/ADR-009: Engine-Based Version Compatibility — this ADR supersedes ADR-009's optionality stance while preserving all other design decisions (minimum-only constraints, semver comparison, enforcement points)
- core/ADR-005: Build-Time Version Constants — provides accurate version values for engine checks and scaffolding
- core/ADR-007: Doctor Diagnostic Command — doctor's engine constraint check (check #9) benefits from non-optional types
- extensions/ADR-002: Extension Types — mandatory engines apply to all three extension types
