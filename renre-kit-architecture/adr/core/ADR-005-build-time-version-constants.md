# ADR-005: Build-Time Version Constants

## Status
Proposed

## Context
The CLI and extension SDK each expose a version string used for:
- `--version` flag output
- Engine compatibility checks (ADR-009)
- User-Agent headers in registry requests
- Diagnostic output (future `renre doctor` command)

Today these versions are **hardcoded string literals** in a `version.ts` file:

```typescript
// packages/cli/src/core/version.ts
export const CLI_VERSION = '0.1.0';

// packages/extension-sdk/src/version.ts
export const SDK_VERSION = '0.1.0';
```

The canonical version lives in each package's `package.json`. Having a second copy in source code creates a **drift risk**: a developer bumps `package.json` but forgets to update `version.ts` (or vice versa). This has already happened during development and will become a real problem post-publish when version accuracy matters for compatibility checks.

## Decision

### 1. Replace hardcoded strings with build-time injection

Each `version.ts` file declares a global constant that the bundler replaces at build time:

```typescript
// packages/cli/src/core/version.ts
declare const __CLI_VERSION__: string;
export const CLI_VERSION = __CLI_VERSION__;

// packages/extension-sdk/src/version.ts
declare const __SDK_VERSION__: string;
export const SDK_VERSION = __SDK_VERSION__;
```

### 2. tsup `define` reads from `package.json`

```typescript
// packages/cli/tsup.config.ts
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  // ...existing config
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
  },
});
```

```typescript
// packages/extension-sdk/tsup.config.ts
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  // ...existing config
  define: {
    __SDK_VERSION__: JSON.stringify(pkg.version),
  },
});
```

The CLI package also needs the SDK version for engine compatibility checks. It reads the SDK `package.json` at build time:

```typescript
// packages/cli/tsup.config.ts
const sdkPkg = JSON.parse(
  readFileSync('../extension-sdk/package.json', 'utf-8')
);

export default defineConfig({
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
    __SDK_VERSION__: JSON.stringify(sdkPkg.version),
  },
});
```

### 3. CI lint check

A CI step greps `version.ts` files for hardcoded version patterns to prevent regression:

```bash
# Fail if version.ts contains a hardcoded semver string
if grep -rE "= ['\"][0-9]+\.[0-9]+\.[0-9]" packages/*/src/**/version.ts; then
  echo "ERROR: Hardcoded version found in version.ts — use build-time injection"
  exit 1
fi
```

### 4. Test-time fallback

In Vitest, `tsup` does not run, so the `declare const` would be undefined. The test environment defines fallbacks:

```typescript
// vitest.config.ts (per package)
export default defineConfig({
  define: {
    __CLI_VERSION__: JSON.stringify('0.0.0-test'),
    __SDK_VERSION__: JSON.stringify('0.0.0-test'),
  },
});
```

## Consequences

### Positive
- **Single source of truth**: Version is defined in `package.json` only — no drift possible
- **Zero manual steps**: Bumping `package.json` version (via `npm version` or manually) automatically propagates to all runtime code
- **Build-time cost only**: The `define` replacement happens during bundling; no runtime file reads or `require()` calls
- **CI safety net**: The grep check catches accidental reintroduction of hardcoded versions

### Negative
- **Build required for accurate version**: Running `tsx` directly (e.g., during development without `pnpm dev`) would see `undefined` for version constants. Mitigation: dev mode uses `pnpm dev` which runs tsup in watch mode.
- **Cross-package dependency**: CLI's tsup config reads SDK's `package.json` at build time. If the relative path changes, the build breaks. Mitigation: Turborepo's dependency graph ensures SDK builds first.
- **Test version is synthetic**: Tests see `0.0.0-test` instead of the real version. Acceptable because tests should not depend on the exact version string.

## Alternatives Considered
- **Runtime `require('../package.json')`**: Works but adds a filesystem read on every CLI invocation. Also fragile when the package is bundled — the relative path to `package.json` may not survive bundling.
- **`genversion` package**: Generates a `version.ts` file from `package.json` as a prebuild step. Adds a dependency and a generated file that must be gitignored. tsup `define` achieves the same result with zero dependencies.
- **Environment variable**: Set `CLI_VERSION` via env in the build script. Less reliable — env vars can be unset or overridden accidentally.

## Related Decisions
- extensions/ADR-009: Engine-Based Version Compatibility — consumes CLI_VERSION and SDK_VERSION for compatibility checks
- → extensions/ADR-010: Mandatory Engine Constraints — depends on accurate version constants for hard-fail enforcement
