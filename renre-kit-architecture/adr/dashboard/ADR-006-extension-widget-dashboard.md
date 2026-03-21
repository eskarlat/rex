# ADR-006: Extension Widget Dashboard

## Status

Accepted

## Context

The dashboard HomePage is currently a static page showing only an active extension count. Extensions already provide full-page **panels** (lazy-loaded ESM bundles via `React.lazy` + dynamic `import()`). Users want a customizable overview — small, constrained UI components from extensions placed on the HomePage in a draggable grid layout.

Key requirements:

- Extensions declare widgets in their manifest, alongside panels
- Widgets use the same loading pipeline as panels (manifest declaration, esbuild bundle, server serving, `React.lazy` import)
- Users can add, remove, and reorder widgets on a drag-and-drop grid
- Layout persists per-project

## Decision

### 1. Widgets Reuse the Panel Loading Pipeline

Widgets are loaded identically to panels: ESM dynamic import from `/api/extensions/{name}/widgets/{widgetId}.js`. They receive the same `PanelProps` (SDK, extensionName, projectPath). The server serves widget bundles using the same `findExtensionUiAsset` function used for panels. Extensions build widgets with the same `buildPanel` function from the SDK.

### 2. `@dnd-kit` for Drag-and-Drop

Chosen over `react-grid-layout` for its flexibility, smaller bundle size, and better React 19 compatibility. Provides `DndContext` + `SortableContext` for reordering, with `useSortable` on individual widget cards.

### 3. Layout Persistence in Project-Scoped JSON File

Dashboard layout is stored in `.renre-kit/dashboard-layout.json` (not SQLite) because:

- Layout is UI-specific, not domain data
- JSON is human-readable and easy to version control
- Follows the same pattern as `plugins.json` for per-project state
- No migration concerns for schema changes

### 4. 12-Column CSS Grid with 100px Row Height

Widget sizes use a 12-column grid system:

- `w` = number of columns (1–12, where 12 = full width)
- `h` = number of rows (each row = 100px)
- Extensions declare `defaultSize`, optional `minSize` and `maxSize`

### 5. Manifest Declaration

Widgets are declared in `manifest.json` under `ui.widgets[]` alongside `ui.panels[]`:

```json
{
  "ui": {
    "panels": [...],
    "widgets": [
      {
        "id": "status-widget",
        "title": "Status",
        "entry": "dist/status-widget.js",
        "defaultSize": { "w": 4, "h": 2 }
      }
    ]
  }
}
```

## Consequences

### Positive

- **Reuse:** No new loading infrastructure — widgets use the exact same pipeline as panels
- **Familiar DX:** Extension authors use the same tools, same props, same build process
- **Flexible layout:** Users customize their dashboard without extension author involvement
- **Lightweight persistence:** JSON file is simple, portable, and project-scoped
- **Progressive enhancement:** Extensions work without widgets; widgets are additive

### Negative

- **Additional dependency:** `@dnd-kit` adds ~15KB to the UI bundle
- **Complexity:** Widget grid management (add/remove/reorder/persist) adds UI complexity
- **Testing difficulty:** Drag-and-drop interactions are hard to test in jsdom; requires mocking dnd-kit hooks
- **Duplication risk:** `DynamicWidget` mirrors `DynamicPanel` — mitigated by extracting shared `UiAssetErrorBoundary`
