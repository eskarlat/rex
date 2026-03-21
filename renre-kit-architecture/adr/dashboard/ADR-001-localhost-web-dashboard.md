# ADR-001: Browser-Based Dashboard on Localhost

## Status

Accepted

## Context

Extensions need to provide custom UI panels for configuration, monitoring, and interaction. Terminal UIs (using libraries like blessed or ink) are fundamentally limited:

- Cannot express complex layouts, rich styling, or custom components
- Difficult to provide extension-specific panels in a unified interface
- Poor UX for data-heavy dashboards

The dashboard must serve as the primary UI for the system while remaining lightweight and inclusive of extension capabilities.

## Decision

Implement a browser-based dashboard running on localhost as a Fastify server. The system will:

1. Start a Fastify server on a dynamic or configured port (default localhost:3000)
2. Serve a React single-page application
3. Extensions ship pre-built React component bundles that are loaded dynamically
4. Communication via REST API to the CLI core managers
5. Dashboard is launched automatically on first activation or manually by the user

## Alternatives Considered

- **Terminal UI (blessed, ink)**: Limited layout flexibility, no custom extension UIs, poor for complex interfaces
- **Electron app**: Full platform control but heavy binary, separate installation, longer startup, complex tooling
- **Web server without local UI**: Users must use separate browser tab, less convenient, no auto-launch

## Consequences

### Positive

- **Full React/HTML capability**: Extensions can build sophisticated UIs with standard web tech
- **Familiar tech stack**: React ecosystem, familiar to most developers
- **Lightweight core**: No heavy native frameworks, small footprint
- **Auto-launch**: Can open browser automatically on startup
- **Accessibility**: Web standards mean better accessibility support

### Negative

- **Server overhead**: Requires running a persistent Fastify server
- **Browser dependency**: Requires a browser to be available
- **Port management**: Must handle port conflicts gracefully
- **Requires Node.js runtime**: Cannot be simplified to pure static binaries
- **Security surface**: HTTP server is a potential attack surface (mitigated by localhost-only binding)
