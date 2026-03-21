# Extension Installation Fix — Architecture Plan

## Problem

When an extension is installed via `ext:add`, the CLI git-clones the extension repo to
`~/.renre-kit/extensions/{name}@{version}/`. The cloned directory contains compiled `dist/` files
but **no `node_modules/`**. This causes runtime failures:

1. **MCP extensions** (e.g., atlassian-mcp): `dist/server.js` does `import { Server } from '@modelcontextprotocol/sdk/server/index.js'` — crashes because `@modelcontextprotocol/sdk` is not installed.
2. **Standard extensions**: `dist/index.js` does `import type { HookContext } from '@renre-kit/extension-sdk/node'` — the compiled JS still has `import ... from '@renre-kit/extension-sdk/node'` which can't resolve.
3. **Command handlers**: Same problem — any handler importing from the SDK or third-party packages fails.

The current build uses **plain `tsc`** for Node.js code (hooks, commands, MCP server), which only
transpiles TypeScript but does NOT bundle dependencies. Meanwhile, the UI panel build already
uses **esbuild bundling** via `buildPanel()` — and works correctly because everything is inlined.

## Root Cause

Two separate build strategies for a single distribution model:
- **UI panels**: esbuild-bundled → self-contained → works after install ✅
- **Node.js code** (server, hooks, commands): tsc-transpiled → external imports → broken after install ❌

## How Other Extension Systems Solve This

| System | Approach |
|--------|----------|
| **VSCode** | Extensions distributed as `.vsix` (zip). Authors **must bundle** with webpack/esbuild. `vsce package` validates this. All deps inlined. |
| **Obsidian** | Extensions ship as a single `main.js` bundle (esbuild/rollup). No node_modules needed at runtime. |
| **Raycast** | Extensions are bundled at build time. Single-file distribution. |
| **Backstage** | Plugins are npm packages installed into the app's `node_modules`. Different model (app-level). |
| **Homebridge** | Plugins are npm packages. `npm install` runs during plugin installation. |

**Two viable strategies:**
1. **Bundle everything** (VSCode/Obsidian model) — self-contained artifacts, no install step
2. **Run `npm install`** (Homebridge model) — install deps after clone

### Recommendation: **Strategy 1 — Bundle everything** (with Strategy 2 as fallback)

Bundling is the better primary approach because:
- Faster installation (no npm install step)
- Deterministic (no version drift from registry)
- Smaller disk footprint (tree-shaken, no duplicate deps)
- Works offline after install
- Already proven working for UI panels in this codebase

Strategy 2 (`npm install` fallback) is needed for edge cases where bundling is impractical
(e.g., native modules like `better-sqlite3`).

---

## Implementation Plan

### Phase 1: Add `buildExtension()` to the Extension SDK

Add a new `buildExtension()` function in `packages/extension-sdk/src/node/` alongside the existing
`buildPanel()`. This bundles ALL Node.js entry points into self-contained files.

**File: `packages/extension-sdk/src/node/build-extension.ts`**

```typescript
import type { BuildOptions } from 'esbuild';

export interface BuildExtensionOptions {
  /** Node.js entry points to bundle (hooks, commands, MCP server) */
  entryPoints: Array<{ in: string; out: string }>;
  /** Output directory (typically 'dist') */
  outdir: string;
  /** Packages to keep as external imports (not bundled) */
  external?: string[];
  /** Enable minification */
  minify?: boolean;
}

export async function buildExtension(options: BuildExtensionOptions): Promise<void> {
  const { build } = await import('esbuild');

  await build({
    entryPoints: options.entryPoints.map((e) => ({ in: e.in, out: e.out })),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outdir: options.outdir,
    external: options.external ?? [],
    // Mark node: builtins as external
    packages: undefined,
    banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
    minify: options.minify ?? false,
  });
}
```

Key design decisions:
- `platform: 'node'` — correctly handles Node.js builtins
- `bundle: true` — inlines all dependencies (SDK, MCP SDK, etc.)
- `format: 'esm'` — matches the existing ESM-throughout convention
- `banner` with `createRequire` — handles any CJS interop edge cases
- `external` option — escape hatch for native modules that can't be bundled

### Phase 2: Update Extension Build Scripts

Replace `tsc` with the new `buildExtension()` for Node.js code in each extension.

**Example: `extensions/atlassian-mcp/build.js`** (replaces `tsc && node build-panel.js`):

```javascript
import { buildExtension } from '@renre-kit/extension-sdk/node';
import { buildPanel } from '@renre-kit/extension-sdk/node';

// Bundle Node.js entry points (MCP server, hooks, commands)
await buildExtension({
  entryPoints: [
    { in: 'src/server.ts', out: 'server' },
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/commands/status.ts', out: 'commands/status' },
  ],
  outdir: 'dist',
});

// Bundle UI panels (already works)
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/my-tasks-widget.tsx', out: 'my-tasks-widget' },
    { in: 'src/ui/comments-widget.tsx', out: 'comments-widget' },
    { in: 'src/ui/confluence-updates-widget.tsx', out: 'confluence-updates-widget' },
  ],
  outdir: 'dist',
});
```

Update `package.json` script:
```json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

Do the same for all extensions: hello-world, context7-mcp, figma-mcp, miro-mcp, github-mcp.

### Phase 3: Update `create-renre-extension` Templates

Update the scaffolding tool so newly generated extensions use `buildExtension()` by default.
Templates should include a `build.js` that calls both `buildExtension()` and `buildPanel()`.

### Phase 4: Add `npm install` Fallback in Installation

For extensions that can't fully bundle (native modules), add an optional post-install step.

**In `registry-manager.ts` `installExtension()`:**

```typescript
export async function installExtension(
  name: string,
  gitUrl: string,
  version: string,
  registryName?: string,
): Promise<string> {
  const extDir = path.join(getExtensionsDir(), `${name}@${version}`);

  // ... existing clone/copy logic ...

  // Post-install: run npm install if package.json has production dependencies
  // and node_modules doesn't exist (i.e., not pre-bundled)
  await postInstallDeps(extDir);

  return extDir;
}

async function postInstallDeps(extDir: string): Promise<void> {
  const pkgPath = path.join(extDir, 'package.json');
  const nodeModulesPath = path.join(extDir, 'node_modules');

  if (!fs.existsSync(pkgPath) || fs.existsSync(nodeModulesPath)) {
    return; // No package.json or already installed
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = pkg.dependencies ?? {};

  // Skip if no real dependencies (workspace:* references don't count outside monorepo)
  const realDeps = Object.entries(deps).filter(
    ([, v]) => !String(v).startsWith('workspace:'),
  );

  if (realDeps.length === 0) {
    return;
  }

  // Check if dist files appear to be bundled (contain no bare import specifiers)
  // If bundled, skip npm install
  if (await isBundled(extDir, pkg)) {
    return;
  }

  // Run npm install --omit=dev for production deps only
  const { execSync } = await import('node:child_process');
  execSync('npm install --omit=dev --ignore-scripts', {
    cwd: extDir,
    stdio: 'pipe',
    timeout: 60_000,
  });
}
```

### Phase 5: Handle `workspace:*` References

When extensions are cloned from git, their `package.json` may still contain `workspace:*` references
to `@renre-kit/extension-sdk`. Since the extension is now bundled, these references are harmless
(the SDK is inlined). But if the fallback `npm install` runs, we need to rewrite them.

Add a step that replaces `workspace:*` with the actual published version before `npm install`:

```typescript
function rewriteWorkspaceRefs(pkgPath: string, sdkVersion: string): void {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  let changed = false;

  for (const depType of ['dependencies', 'devDependencies']) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const [name, version] of Object.entries(deps)) {
      if (String(version).startsWith('workspace:')) {
        if (name === '@renre-kit/extension-sdk') {
          deps[name] = `^${sdkVersion}`;
          changed = true;
        } else {
          delete deps[name]; // Unknown workspace ref, remove
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `packages/extension-sdk/src/node/build-extension.ts` | **CREATE** | New `buildExtension()` function for bundling Node.js entry points |
| `packages/extension-sdk/src/node/types.ts` | **EDIT** | Add `BuildExtensionOptions` type |
| `packages/extension-sdk/src/node/index.ts` | **EDIT** | Export `buildExtension` |
| `packages/extension-sdk/tsup.config.ts` | **VERIFY** | Ensure `src/node/index.ts` entry already covers new export |
| `extensions/atlassian-mcp/build.js` | **CREATE** | Unified build script using `buildExtension()` + `buildPanel()` |
| `extensions/atlassian-mcp/package.json` | **EDIT** | Change build script to `node build.js` |
| `extensions/hello-world/build.js` | **CREATE** | Same pattern |
| `extensions/hello-world/build-panel.js` | **DELETE** | Replaced by `build.js` |
| `extensions/hello-world/package.json` | **EDIT** | Change build script |
| `extensions/context7-mcp/build.js` | **CREATE** | Same pattern (if has Node entry points) |
| `extensions/figma-mcp/build.js` | **CREATE** | Same pattern |
| `extensions/miro-mcp/build.js` | **CREATE** | Same pattern |
| `extensions/github-mcp/build.js` | **CREATE** | Same pattern |
| `packages/cli/src/features/registry/registry-manager.ts` | **EDIT** | Add `postInstallDeps()` fallback after clone |
| `packages/create-renre-extension/` | **EDIT** | Update templates to use `buildExtension()` |

---

## Migration Path

1. **Existing extensions in the monorepo**: Update build scripts, rebuild, push new versions to registry
2. **Already-installed extensions**: Users run `ext:update` to get the bundled version
3. **Third-party extensions**: Document the new `buildExtension()` API in SDK docs; old extensions still work via `npm install` fallback
4. **Backward compatibility**: The `npm install` fallback ensures old unbundled extensions don't break

## Testing Strategy

1. Build each extension with the new `buildExtension()` and verify `dist/` files are self-contained
2. Simulate installation: copy dist to a temp directory WITHOUT node_modules, run `node dist/server.js` — should work
3. Test the `npm install` fallback path with a deliberately unbundled extension
4. Run existing E2E tests (`pnpm test:e2e`) and integration tests (`pnpm test:cli`)
5. Test full lifecycle: `ext:add` → `ext:activate` → run command → run MCP tool → `ext:deactivate`
