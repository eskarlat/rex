# ADR-004: Dynamic Imports for Extension UI Panels (Not Iframes)

## Status
Accepted

## Context
The web dashboard needs to display extension-specific UI panels (e.g., Figma design panel, Claude AI panel). Extensions need to extend the dashboard UI dynamically.

Two approaches were considered:
1. **Dynamic imports**: Pre-built React bundles loaded at runtime via `import()`, integrated into the main React tree
2. **Iframes**: Sandboxed HTML/JS loaded into an iframe, communicating via postMessage

Each has tradeoffs around isolation, styling, state sharing, and complexity.

## Decision
Use dynamic JavaScript imports for extension UI panels:
- Extensions pre-build their UI as a React component bundle (ESM)
- Dashboard fetches the bundle from `~/.renre-kit/extensions/{name}/{version}/ui.js`
- Runtime: `const Panel = await import(url); <Panel {...props} />`
- Panel component receives props: `{ context, commands, theme }`

## Consequences

### Positive
- Seamless theming: Panel components use the same theme context as the dashboard
- Direct prop passing: Context and state flow naturally through React props; no serialization
- Shared React instance: Panels use the same React version as the dashboard; no duplication
- Simpler communication: No postMessage protocol needed; standard React patterns apply
- Hot reload friendly: Development experience mirrors standard React

### Negative
- No process isolation: Extension code runs in the dashboard process; a crash or infinite loop blocks the UI
- Shared dependencies: Panels must be compatible with dashboard's React version
- CSS collisions: Global styles in panel bundles can override dashboard styles
- Bundle size: Each panel adds to the dashboard bundle size
- Harder to debug: Errors in panel code reported in dashboard console, not isolated logs

## Security & Stability Mitigations
- **Error Boundaries**: Wrap each panel in a React Error Boundary to catch and contain crashes
- **CSS namespacing**: Require panels to use CSS modules or scoped styles (e.g., BEM, CSS-in-JS)
- **Bundle limits**: Enforce maximum bundle size (e.g., 100 KB gzipped) for panels
- **Runtime isolation**: Could be improved in future with Web Workers, but adds complexity

## Alternatives Considered
- **Iframes**: Full isolation, but complex cross-origin communication; loss of theming; postMessage serialization overhead
- **Web Components**: Shadow DOM isolation, but interop complexity with React; still need communication protocol
- **Web Workers**: Offload compute, but can't render UI directly; still need main-thread component

## Implementation
- **Build step**: Panel authors build with `esbuild` or similar, targeting ESM
- **Export format**: Panel exports a default React component:
  ```typescript
  export default function FigmaPanel({ context, commands, theme }) {
    // ...
  }
  ```
- **Error Boundary wrapper**: Dashboard wraps import in try-catch and Error Boundary
- **Props contract**: Define stable props interface; version if needed

## Related Decisions
- ADR-005: Bundled MCP Servers (extensions include all necessary code)
- ADR-002: Three Extension Types (UI panels only for standard JS extensions)
