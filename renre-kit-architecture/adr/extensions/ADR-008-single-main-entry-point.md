# ADR-008: Single Main Entry Point for Extension Hooks

## Status

Accepted

## Context

Extensions declare lifecycle hooks (`onInit`, `onDestroy`) that the core invokes during activation and deactivation. The original design mapped each hook to a file path in the manifest:

```json
"hooks": {
  "onInit": "src/index.js",
  "onDestroy": "src/index.js"
}
```

This created three problems:

1. **Redundant mapping**: In practice, both hooks always pointed to the same file. The per-hook file path added configuration surface area with no real benefit.
2. **Ambiguous contract**: The manifest specified _where_ the hook lived but not _how_ it was exported. The core had to guess — first trying `default` export, then falling back to the module object itself — but extensions actually used **named exports** (`export function onInit`). This mismatch caused hooks to silently fail, meaning agent assets (skills, prompts, context) were never deployed on activation.
3. **Inconsistency with commands**: Command handlers are already resolved as named exports from the extension's entry file. Hooks used a different, less reliable mechanism.

## Decision

Replace the `hooks` manifest field with a single `main` entry point:

```json
"main": "src/index.js"
```

The core imports the module at `main` and looks for well-known **named exports** (`onInit`, `onDestroy`). If the export exists and is a function, it is called with the hook context. If `main` is not specified, no hooks are executed.

The hook contract is now explicit:

- Export `onInit(ctx: { projectDir: string })` to run code on activation
- Export `onDestroy(ctx: { projectDir: string })` to run code on deactivation
- Both are optional — only exported functions are called

## Consequences

### Positive

- **Eliminates the class of bug that caused silent hook failures** — named export lookup is now explicit and matches what extensions actually export
- **Simpler manifest**: One field (`main`) replaces a nested object (`hooks.onInit`, `hooks.onDestroy`)
- **Consistent pattern**: Mirrors Node.js `package.json` `main` convention and aligns with how command handlers are already resolved
- **Easier to document and scaffold**: Extension authors declare one entry point; the core handles the rest
- **Extensible**: Future lifecycle hooks (e.g., `onUpdate`, `onConfigChange`) can be added as named exports without manifest schema changes

### Negative

- **Breaking change**: Existing extension manifests using `hooks` must migrate to `main`. Affects all installed extensions.
- **Single file constraint**: All hooks must be exported from one module. For large extensions this could lead to a crowded entry file, though re-exports (`export { onInit } from './hooks/init.js'`) mitigate this.

## Related Decisions

- ADR-001: Global Install, Per-Project Activation (activation triggers hooks)
- ADR-002: Extension Types (standard vs MCP extension lifecycle)
