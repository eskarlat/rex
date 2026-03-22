# Agent Browser Extension

A headless Chrome browser automation extension for RenreKit. Wraps the `agent-browser` CLI tool as a bundled dependency.

## Key Concepts

- **Refs**: Element references like `@e1`, `@e2` from `snapshot` command output. Use these to interact with elements.
- **Snapshot loop**: The core pattern — `open` → `snapshot -i` → interact → `wait` → re-snapshot.
- **Headless**: Browser always runs headless. The dashboard panel provides the visual viewport via CDP screencast.
- **CDP**: Chrome DevTools Protocol — used by the panel for real-time frame streaming and element inspection.

## Common Patterns

1. **Always wait after navigation**: SPAs load content asynchronously. Use `wait --target "networkidle"` or wait for a specific selector.
2. **Use `fill` instead of `type`**: `fill` clears the field first, avoiding appended text issues.
3. **Use `find-*` for semantic targeting**: When you know the button text or label, `find-text` and `find-label` are more robust than snapshot refs.
4. **Cookie injection**: Set auth cookies before navigating to skip login flows.
5. **Batch for speed**: Multi-step workflows run faster as a batch (single process) than sequential commands.

## 34 Commands in 7 Groups

Core Navigation (6), Interaction (7), Capture & Extraction (7), Find Elements (3), Tabs/Cookies/Storage (5), Debug & Inspect (8), Batch (1).
