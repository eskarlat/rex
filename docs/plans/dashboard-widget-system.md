# Extension Widget System for Dashboard

## Context

The dashboard HomePage is currently a static page showing only an active extension count. Extensions already provide full-page **panels** (lazy-loaded ESM bundles). We want to add **widgets** — small, constrained panels that users can place on the HomePage in a draggable grid layout. Widgets use the same loading pipeline as panels (manifest declaration, esbuild bundle, server serving, `React.lazy` import) but add size metadata and live on a `@dnd-kit`-powered grid. Layout is persisted per-project in `.renre-kit/dashboard-layout.json`.

---

## Phase 0: Architecture Documentation (ADR, DFD, Sequence Diagram)

**Goal:** Document the widget system design before implementation. Creates the architectural record for future reference.

### Save plan to project

**`docs/plans/dashboard-widget-system.md`**

- Copy this plan file into the project's docs/plans/ folder for team reference

### Files to create

**`renre-kit-architecture/adr/dashboard/ADR-006-extension-widget-dashboard.md`**

- ADR documenting the widget system decision
- Sections: Status (Accepted), Context, Decision, Consequences (Positive/Negative)
- Key decisions to document:
  - Widgets reuse the panel loading pipeline (ESM dynamic import, same SDK props, same build tool)
  - `@dnd-kit` chosen for drag-and-drop (over react-grid-layout) for flexibility
  - Layout persistence in project-scoped `.renre-kit/dashboard-layout.json` (not SQLite)
  - 12-column CSS grid with 100px row height
  - Widgets declared in manifest `ui.widgets[]` alongside `ui.panels[]`

**`renre-kit-architecture/diagrams/widget-dashboard-dfd.md`**

- Data Flow Diagram (Mermaid flowchart, same style as `dfd-overview.md`)
- Flows to diagram:
  1. **Widget Loading Flow** — Browser → WidgetGrid → DynamicWidget → `import(/api/extensions/{name}/widgets/{id}.js)` → Server → `findExtensionUiAsset` → manifest lookup → file read → JS response → Browser renders component with SDK props
  2. **Layout Persistence Flow** — User drags/adds/removes widget → WidgetGrid → `PUT /api/dashboard/layout` → Server → `saveDashboardLayout(projectPath, layout)` → writes `.renre-kit/dashboard-layout.json`
  3. **Widget Discovery Flow** — WidgetPicker → `useMarketplace()` → `GET /api/marketplace` → Server loads manifests → extracts `ui.widgets[]` metadata → returns to UI → WidgetPicker shows available widgets

**`renre-kit-architecture/diagrams/widget-dashboard-seq.md`**

- Sequence Diagrams (Mermaid sequenceDiagram syntax)
- Sequences to diagram:
  1. **Dashboard page load** — Browser → HomePage → WidgetGrid → useDashboardLayout → GET /api/dashboard/layout → Server → getDashboardLayout → .renre-kit/dashboard-layout.json → response → for each widget: DynamicWidget → import(widget URL) → Server serves JS → render
  2. **Add widget** — User clicks "Add Widget" → WidgetPicker opens → useMarketplace data shown → user selects widget → handleAddWidget → PUT /api/dashboard/layout → Server saves → grid re-renders with new widget
  3. **Drag reorder** — User drags widget → @dnd-kit DragEnd → handleDragEnd reorders array → PUT /api/dashboard/layout → Server saves

### Validation

1. **Plan vs Implementation** — verify all planned files were created:
   - [ ] `renre-kit-architecture/adr/dashboard/ADR-006-extension-widget-dashboard.md` — created
   - [ ] `renre-kit-architecture/diagrams/widget-dashboard-dfd.md` — created
   - [ ] `renre-kit-architecture/diagrams/widget-dashboard-seq.md` — created
2. **Content review** — diagrams render correctly in Mermaid, ADR follows existing format (Status/Context/Decision/Consequences)
3. **No code changes** — this phase is documentation only

---

## Phase 1: CLI Types + Manifest Validation

**Goal:** Define `UiWidget` type and Zod validation. Foundation for all other phases.

### Files to modify

**`packages/cli/src/features/extensions/types/extension.types.ts`**

- Add `WidgetSize { w: number; h: number }` interface
  - `w` = number of grid columns (1–12, where 12 = full dashboard width)
  - `h` = number of grid rows (each row = 100px, so h:2 = 200px tall)
- Add `UiWidget { id, title, entry, defaultSize: WidgetSize, minSize?: WidgetSize, maxSize?: WidgetSize }` interface
- Add `widgets: UiWidget[]` to `ExtensionManifest.ui` (alongside existing `panels`)

**`packages/cli/src/features/extensions/types/index.ts`**

- Re-export `UiWidget`, `WidgetSize`

**`packages/cli/src/features/extensions/manifest/manifest-loader.ts`**

- Add `widgetSizeSchema = z.object({ w: z.number(), h: z.number() })`
- Add `uiWidgetSchema = z.object({ id, title, entry, defaultSize, minSize?, maxSize? })`
- Update `ui` field: `panels: z.array(uiPanelSchema).default([])`, `widgets: z.array(uiWidgetSchema).default([])`
  - Note: changing `panels` from required to `.default([])` is backward-compatible

**`packages/cli/src/features/extensions/manifest/manifest-loader.test.ts`** (TDD — write first)

- `should load manifest with widgets array`
- `should accept widget with all size fields`
- `should accept widget with only required fields`
- `should reject widget missing defaultSize`
- `should accept empty widgets array`
- `should accept manifest with panels but no widgets`
- `should accept manifest with widgets but no panels` (verifies `.default([])` on panels)

**`packages/cli/src/lib.ts`**

- Add `UiWidget, WidgetSize` to type exports (line 41)

### Validation

1. **Plan vs Implementation** — verify all planned files were touched:
   - [ ] `packages/cli/src/features/extensions/types/extension.types.ts` — modified
   - [ ] `packages/cli/src/features/extensions/types/index.ts` — modified
   - [ ] `packages/cli/src/features/extensions/manifest/manifest-loader.ts` — modified
   - [ ] `packages/cli/src/features/extensions/manifest/manifest-loader.test.ts` — modified
   - [ ] `packages/cli/src/lib.ts` — modified
2. **Tests** — `pnpm --filter @renre-kit/cli test -- src/features/extensions/manifest/manifest-loader.test.ts`
   - All new widget tests pass
   - All existing panel tests still pass (no regression from `.default([])` change)
3. **Lint** — `pnpm --filter @renre-kit/cli lint`
   - No new warnings or errors. Address every warning including `no-explicit-any`, complexity limits.
4. **Typecheck** — `pnpm --filter @renre-kit/cli typecheck`
   - `UiWidget` and `WidgetSize` types resolve correctly across the package
   - `ExtensionManifest.ui.widgets` is properly typed
5. **Duplication** — `pnpm lint:duplication`
   - No new duplication flagged (widget Zod schema is structurally unique from panel schema)

---

## Phase 2: Dashboard Layout Manager (CLI)

**Goal:** Read/write `.renre-kit/dashboard-layout.json` — same pattern as `readPluginsJson`/`writePluginsJson` in extension-manager.

### Files to create

**`packages/cli/src/core/types/dashboard.types.ts`**

```typescript
export interface WidgetPlacement {
  id: string; // "extensionName:widgetId"
  extensionName: string;
  widgetId: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}
export interface DashboardLayout {
  widgets: WidgetPlacement[];
}
```

**`packages/cli/src/features/dashboard/dashboard-layout.test.ts`** (TDD — write first)

- `returns empty layout when file does not exist`
- `reads and returns layout from file`
- `saves layout to file`
- `creates .renre-kit dir if missing`
- `overwrites existing layout`
- `handles malformed JSON gracefully (returns empty)`

Pattern: use `mkdtempSync` + temp dir like `manifest-loader.test.ts` (lines 9-17)

**`packages/cli/src/features/dashboard/dashboard-layout.ts`**

- `getDashboardLayout(projectPath): DashboardLayout` — read file, return `{ widgets: [] }` on missing/malformed
- `saveDashboardLayout(projectPath, layout): void` — write JSON, mkdir if needed

**`packages/cli/src/lib.ts`**

- Add exports: `getDashboardLayout`, `saveDashboardLayout`, types `DashboardLayout`, `WidgetPlacement`

### Validation

1. **Plan vs Implementation** — verify all planned files were touched:
   - [ ] `packages/cli/src/core/types/dashboard.types.ts` — created
   - [ ] `packages/cli/src/features/dashboard/dashboard-layout.ts` — created
   - [ ] `packages/cli/src/features/dashboard/dashboard-layout.test.ts` — created
   - [ ] `packages/cli/src/lib.ts` — modified (new exports added)
2. **Tests** — `pnpm --filter @renre-kit/cli test`
   - All 6 new dashboard-layout tests pass
   - Full CLI test suite passes (no regressions from lib.ts export additions)
3. **Lint** — `pnpm --filter @renre-kit/cli lint`
   - No warnings. Pay attention to `noUncheckedIndexedAccess` in the JSON parsing logic.
4. **Typecheck** — `pnpm --filter @renre-kit/cli typecheck`
   - `DashboardLayout` and `WidgetPlacement` types resolve in lib.ts exports
5. **Duplication** — `pnpm lint:duplication`
   - `getDashboardLayout`/`saveDashboardLayout` are simple and unique — no duplication expected

---

## Phase 3: Server Routes

**Goal:** Widget serving endpoint, dashboard layout CRUD, marketplace widget metadata.

### Files to modify

**`packages/server/src/features/extensions/extensions.routes.ts`**

- Refactor `findExtensionPanel` → generic `findExtensionUiAsset(name, projectPath, assetType: 'panels' | 'widgets', assetId?)` to avoid jscpd duplication. Reuse for both panel and widget routes.
- Add route: `GET /api/extensions/:name/widgets/:widgetId.js` — serves widget JS (mirrors panel route at line 171)
- Update marketplace response (line 99-105): add `widgets` field with `{ id, title, defaultSize, minSize?, maxSize? }` for active extensions

**`packages/server/src/features/extensions/extensions.routes.test.ts`** (TDD — write first)

- `GET /api/extensions/:name/widgets/:widgetId.js` — serves widget by ID (200), returns 404 for unknown
- Marketplace returns `widgets` metadata for active extensions
- Marketplace returns empty `widgets` when manifest has no widgets

### Files to create

**`packages/server/src/features/dashboard/dashboard.routes.test.ts`** (TDD — write first)

- `GET /api/dashboard/layout` — returns layout for project
- `GET /api/dashboard/layout` — returns empty layout when no project
- `PUT /api/dashboard/layout` — saves layout, calls `saveDashboardLayout`
- `PUT /api/dashboard/layout` — returns 400 without project

Mock pattern: follow `extensions.routes.test.ts` — mock `@renre-kit/cli/lib` with `mockGetDashboardLayout`, `mockSaveDashboardLayout`

**`packages/server/src/features/dashboard/dashboard.routes.ts`**

- `GET /api/dashboard/layout` → `getDashboardLayout(projectPath)`
- `PUT /api/dashboard/layout` → `saveDashboardLayout(projectPath, body)`
- Pattern: follow `settings.routes.ts` — Fastify plugin callback, `done()`, project from `request.projectPath ?? fastify.activeProjectPath`

**`packages/server/src/server.ts`**

- Import and register `dashboardRoutes` (line 64 area)

### Validation

1. **Plan vs Implementation** — verify all planned files were touched:
   - [ ] `packages/server/src/features/extensions/extensions.routes.ts` — modified (refactor + widget route + marketplace)
   - [ ] `packages/server/src/features/extensions/extensions.routes.test.ts` — modified (widget + marketplace tests)
   - [ ] `packages/server/src/features/dashboard/dashboard.routes.ts` — created
   - [ ] `packages/server/src/features/dashboard/dashboard.routes.test.ts` — created
   - [ ] `packages/server/src/server.ts` — modified (register dashboard routes)
2. **Tests** — `pnpm --filter @renre-kit/server test`
   - Widget serving tests (200/404) pass
   - Marketplace widget metadata tests pass
   - Dashboard layout CRUD tests pass
   - All existing extension route tests still pass (refactored `findExtensionUiAsset` must not break panel serving)
3. **Lint** — `pnpm --filter @renre-kit/server lint`
   - No warnings. Check `findExtensionUiAsset` for complexity (must stay under cyclomatic 10).
4. **Typecheck** — `pnpm --filter @renre-kit/server typecheck`
   - Imports from `@renre-kit/cli/lib` resolve for new exports (`getDashboardLayout`, `saveDashboardLayout`, `DashboardLayout`)
5. **Duplication** — `pnpm lint:duplication`
   - The `findExtensionUiAsset` refactor must eliminate prior panel-resolution duplication. Verify no new duplication from dashboard.routes.ts.

---

## Phase 4: UI Components

**Goal:** `@dnd-kit` grid on HomePage with DynamicWidget loading. Largest phase.

### Step 4a: Install dependency

```bash
pnpm --filter @renre-kit/ui add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Step 4b: Extend marketplace types

**`packages/ui/src/core/hooks/use-extensions.ts`**

- Add `ExtensionWidget { id, title, defaultSize, minSize?, maxSize? }` interface
- Add `widgets?: ExtensionWidget[]` to `Extension` interface

**`packages/ui/src/core/hooks/use-extensions.test.ts`**

- Add test: marketplace response includes widget metadata

### Step 4c: Dashboard layout hook

**`packages/ui/src/core/hooks/use-dashboard-layout.test.ts`** (TDD)

- Fetches `/api/dashboard/layout`, returns data
- PUT saves layout, invalidates query

**`packages/ui/src/core/hooks/use-dashboard-layout.ts`**

- `useDashboardLayout()` — React Query for `GET /api/dashboard/layout`
- `useSaveDashboardLayout()` — mutation for `PUT /api/dashboard/layout`, invalidates `['dashboard-layout']`
- Export `WidgetPlacement`, `DashboardLayout` interfaces (UI-side copies)

### Step 4d: Shared ErrorBoundary

**`packages/ui/src/core/components/UiAssetErrorBoundary.tsx`**

- Extract `PanelErrorBoundary` from `DynamicPanel.tsx` (lines 22-39) into shared component
- Avoids jscpd duplication between DynamicPanel and DynamicWidget

**`packages/ui/src/features/extensions/components/DynamicPanel.tsx`**

- Import `UiAssetErrorBoundary` instead of inline `PanelErrorBoundary`

### Step 4e: DynamicWidget

**`packages/ui/src/features/dashboard/components/DynamicWidget.test.tsx`** (TDD)

- Renders container on load
- Shows error when widget fails to load
- Pattern: mirror `DynamicPanel.test.tsx` exactly

**`packages/ui/src/features/dashboard/components/DynamicWidget.tsx`**

- Same pattern as `DynamicPanel.tsx`: `React.lazy(() => import(url))` + Suspense + ErrorBoundary
- URL: `/api/extensions/${extensionName}/widgets/${widgetId}.js`
- Props passed to loaded component: `sdk`, `extensionName`, `projectPath` (same `PanelProps`)

### Step 4f: WidgetCard

**`packages/ui/src/features/dashboard/components/WidgetCard.test.tsx`** (TDD)

- Renders widget title
- Renders DynamicWidget with correct props
- Calls onRemove on remove button click
- Has drag handle element

**`packages/ui/src/features/dashboard/components/WidgetCard.tsx`**

- Uses `useSortable` from `@dnd-kit/sortable`
- Card with: drag handle (GripVertical icon), title, remove button (X icon), DynamicWidget in CardContent
- `gridColumn: span ${size.w}`, `gridRow: span ${size.h}` for CSS grid sizing

### Step 4g: WidgetPicker

**`packages/ui/src/features/dashboard/components/WidgetPicker.test.tsx`** (TDD)

- Shows dialog when open
- Lists available widgets from active extensions (via `useMarketplace`)
- Disables already-added widgets
- Calls onAdd with extensionName, widgetId, defaultSize

**`packages/ui/src/features/dashboard/components/WidgetPicker.tsx`**

- Uses shadcn `Dialog` component
- Reads `useMarketplace()` → flatMaps `ext.widgets` from active extensions
- Shows extension title, widget title, Add/Added button per widget

### Step 4h: WidgetGrid

**`packages/ui/src/features/dashboard/components/WidgetGrid.test.tsx`** (TDD)

- Renders empty state when no widgets
- Renders WidgetCard for each widget
- Shows "Add Widget" button
- Remove callback filters widget from layout and saves

**`packages/ui/src/features/dashboard/components/WidgetGrid.tsx`**

- `DndContext` + `SortableContext` from `@dnd-kit`
- 12-column CSS grid: `grid grid-cols-12 gap-4 auto-rows-[100px]` (each column = 1/12 width, each row = 100px)
- `handleDragEnd`: reorders widgets array, saves
- `handleRemove`: filters widget, saves
- `handleAddWidget`: creates placement `{id: "ext:widget", extensionName, widgetId, position, size}`, saves
- Empty state: "No widgets yet. Click Add Widget to get started."

### Step 4i: Update HomePage

**`packages/ui/src/features/home/HomePage.tsx`**

- Import and render `<WidgetGrid />` after the stats cards section

**`packages/ui/src/features/home/HomePage.test.tsx`**

- Mock `WidgetGrid` with `vi.mock()`, assert it renders via test-id

### Step 4j: SDK type alias

**`packages/extension-sdk/src/core/types.ts`**

- Add `export type WidgetProps = PanelProps;` (semantic alias, no behavior change)

### Validation

1. **Plan vs Implementation** — verify all planned files were touched:
   - [ ] `packages/ui/package.json` — modified (@dnd-kit deps added)
   - [ ] `packages/ui/src/core/hooks/use-extensions.ts` — modified (ExtensionWidget type)
   - [ ] `packages/ui/src/core/hooks/use-extensions.test.ts` — modified (widget test)
   - [ ] `packages/ui/src/core/hooks/use-dashboard-layout.ts` — created
   - [ ] `packages/ui/src/core/hooks/use-dashboard-layout.test.ts` — created
   - [ ] `packages/ui/src/core/components/UiAssetErrorBoundary.tsx` — created
   - [ ] `packages/ui/src/features/extensions/components/DynamicPanel.tsx` — modified (use shared ErrorBoundary)
   - [ ] `packages/ui/src/features/dashboard/components/DynamicWidget.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/DynamicWidget.test.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetCard.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetCard.test.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetGrid.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetGrid.test.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetPicker.tsx` — created
   - [ ] `packages/ui/src/features/dashboard/components/WidgetPicker.test.tsx` — created
   - [ ] `packages/ui/src/features/home/HomePage.tsx` — modified (add WidgetGrid)
   - [ ] `packages/ui/src/features/home/HomePage.test.tsx` — modified (mock WidgetGrid)
   - [ ] `packages/extension-sdk/src/core/types.ts` — modified (WidgetProps alias)
2. **Tests** — `pnpm --filter @renre-kit/ui test`
   - All new component tests pass (DynamicWidget, WidgetCard, WidgetGrid, WidgetPicker)
   - Hook tests pass (use-dashboard-layout, use-extensions widget additions)
   - HomePage tests pass (existing + new WidgetGrid rendering test)
   - DynamicPanel tests still pass after ErrorBoundary extraction
3. **Lint** — `pnpm --filter @renre-kit/ui lint`
   - No warnings. Watch for: `@typescript-eslint/no-explicit-any` in dnd-kit event handlers (use proper DragEndEvent type), cognitive complexity in WidgetGrid (extract hook if > 15).
4. **Typecheck** — `pnpm --filter @renre-kit/ui typecheck`
   - `@dnd-kit/*` types resolve correctly
   - `ExtensionWidget` type used properly in use-extensions.ts
   - DynamicPanel still compiles after ErrorBoundary extraction
5. **Duplication** — `pnpm lint:duplication`
   - Shared `UiAssetErrorBoundary` prevents duplication between DynamicPanel and DynamicWidget
   - If skeleton components trigger duplication, extract shared `UiAssetSkeleton`

---

## Phase 5: Reference Extension (hello-world)

**Goal:** Add a widget to hello-world extension to demonstrate and test the full pipeline.

### Files to modify

**`extensions/hello-world/manifest.json`**

- Add to `ui.widgets`:
  ```json
  {
    "id": "status-widget",
    "title": "Hello Status",
    "entry": "dist/status-widget.js",
    "defaultSize": { "w": 4, "h": 2 },
    "minSize": { "w": 3, "h": 2 },
    "maxSize": { "w": 6, "h": 4 }
  }
  ```

  - `w:4` = 4/12 columns = ~33% of dashboard width
  - `h:2` = 2 rows × 100px = 200px tall

**`extensions/hello-world/build-panel.js`**

- Add `buildPanel('src/ui/status-widget.tsx', 'dist/status-widget.js')` to the build array
- `buildPanel` works identically for widgets (same ESM + React globals)

### Files to create

**`extensions/hello-world/src/ui/status-widget.tsx`**

- Simple widget: shows extension name, "Quick Greet" button that calls `sdk.exec.run('hello-world:greet')`
- Uses `PanelProps` interface

### Validation

1. **Plan vs Implementation** — verify all planned files were touched:
   - [ ] `extensions/hello-world/manifest.json` — modified (widgets array added)
   - [ ] `extensions/hello-world/build-panel.js` — modified (build status-widget)
   - [ ] `extensions/hello-world/src/ui/status-widget.tsx` — created
2. **Build** — `cd extensions/hello-world && node build-panel.js`
   - status-widget.tsx compiles to dist/status-widget.js without errors
   - Existing panel builds still succeed
3. **Tests** — `pnpm test`
   - Full monorepo test suite passes
   - Manifest loader accepts hello-world's updated manifest (with widgets array)
4. **Lint** — `pnpm lint`
   - No warnings across all packages. Check status-widget.tsx for lint compliance.
5. **Typecheck** — `pnpm typecheck`
   - All packages compile cleanly
6. **Duplication** — `pnpm lint:duplication`
   - status-widget.tsx is sufficiently unique from other panel sources

---

## Phase 6: Integration + Cleanup

**Goal:** Full validation pass, fix any quality gate issues.

### Validation

1. **Full validate** — `pnpm validate` (runs lint + typecheck + coverage + duplication)
2. **Coverage check** — Every package must meet 86% threshold (statements, branches, functions, lines)
   - If coverage drops, add targeted tests for uncovered branches
3. **Address every warning** — zero warnings policy. Scan lint output for all packages.
4. **Manual smoke test** — Start dev servers (`pnpm --filter @renre-kit/server dev` + `pnpm --filter @renre-kit/ui dev`), open dashboard, verify:
   - "Add Widget" button appears on HomePage
   - Widget picker shows widgets from active extensions
   - Adding a widget renders it in the grid
   - Drag-and-drop reorders widgets
   - Remove button removes widget
   - Layout persists after page reload

### Known risks to address

1. **jscpd duplication** — `DynamicWidget` vs `DynamicPanel`: mitigated by extracting shared `UiAssetErrorBoundary` in Phase 4d. If still flagged, extract `WidgetSkeleton`/`PanelSkeleton` into shared component.
2. **jscpd duplication** — `findExtensionUiAsset` refactor in Phase 3 eliminates panel/widget candidate resolution duplication.
3. **Coverage (86%)** — `@dnd-kit` drag interactions are hard to test in jsdom. Focus tests on callback logic (remove, add, reorder) by mocking dnd-kit hooks. DynamicWidget error cases tested via error boundary (same as DynamicPanel).
4. **Complexity** — If `WidgetGrid` exceeds cognitive complexity 15, extract a `useWidgetGridActions` custom hook for handlers.

---

## File Inventory

### New files (20)

| File                                                                         | Purpose                                |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| `renre-kit-architecture/adr/dashboard/ADR-006-extension-widget-dashboard.md` | ADR for widget system                  |
| `renre-kit-architecture/diagrams/widget-dashboard-dfd.md`                    | Data flow diagrams                     |
| `renre-kit-architecture/diagrams/widget-dashboard-seq.md`                    | Sequence diagrams                      |
| `packages/cli/src/core/types/dashboard.types.ts`                             | WidgetPlacement, DashboardLayout types |
| `packages/cli/src/features/dashboard/dashboard-layout.ts`                    | Read/write dashboard-layout.json       |
| `packages/cli/src/features/dashboard/dashboard-layout.test.ts`               | Tests                                  |
| `packages/server/src/features/dashboard/dashboard.routes.ts`                 | GET/PUT /api/dashboard/layout          |
| `packages/server/src/features/dashboard/dashboard.routes.test.ts`            | Tests                                  |
| `packages/ui/src/core/hooks/use-dashboard-layout.ts`                         | React Query hook for layout            |
| `packages/ui/src/core/hooks/use-dashboard-layout.test.ts`                    | Tests                                  |
| `packages/ui/src/core/components/UiAssetErrorBoundary.tsx`                   | Shared error boundary                  |
| `packages/ui/src/features/dashboard/components/DynamicWidget.tsx`            | Lazy-loading widget                    |
| `packages/ui/src/features/dashboard/components/DynamicWidget.test.tsx`       | Tests                                  |
| `packages/ui/src/features/dashboard/components/WidgetCard.tsx`               | Draggable card wrapper                 |
| `packages/ui/src/features/dashboard/components/WidgetCard.test.tsx`          | Tests                                  |
| `packages/ui/src/features/dashboard/components/WidgetGrid.tsx`               | @dnd-kit grid container                |
| `packages/ui/src/features/dashboard/components/WidgetGrid.test.tsx`          | Tests                                  |
| `packages/ui/src/features/dashboard/components/WidgetPicker.tsx`             | Widget picker dialog                   |
| `packages/ui/src/features/dashboard/components/WidgetPicker.test.tsx`        | Tests                                  |
| `extensions/hello-world/src/ui/status-widget.tsx`                            | Reference widget                       |

### Modified files (14)

| File                                                                    | Change                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/cli/src/features/extensions/types/extension.types.ts`         | Add UiWidget, WidgetSize                                           |
| `packages/cli/src/features/extensions/types/index.ts`                   | Re-export new types                                                |
| `packages/cli/src/features/extensions/manifest/manifest-loader.ts`      | Widget Zod schema                                                  |
| `packages/cli/src/features/extensions/manifest/manifest-loader.test.ts` | Widget validation tests                                            |
| `packages/cli/src/lib.ts`                                               | Export dashboard + widget types                                    |
| `packages/server/src/features/extensions/extensions.routes.ts`          | Widget serving, refactor findExtensionUiAsset, marketplace widgets |
| `packages/server/src/features/extensions/extensions.routes.test.ts`     | Widget route + marketplace tests                                   |
| `packages/server/src/server.ts`                                         | Register dashboard routes                                          |
| `packages/ui/src/core/hooks/use-extensions.ts`                          | ExtensionWidget type                                               |
| `packages/ui/src/core/hooks/use-extensions.test.ts`                     | Widget marketplace test                                            |
| `packages/ui/src/features/home/HomePage.tsx`                            | Add WidgetGrid                                                     |
| `packages/ui/src/features/home/HomePage.test.tsx`                       | Mock WidgetGrid                                                    |
| `packages/ui/src/features/extensions/components/DynamicPanel.tsx`       | Use shared ErrorBoundary                                           |
| `packages/ui/package.json`                                              | Add @dnd-kit deps                                                  |
| `packages/extension-sdk/src/core/types.ts`                              | Add WidgetProps alias                                              |
| `extensions/hello-world/manifest.json`                                  | Add widgets array                                                  |
| `extensions/hello-world/build-panel.js`                                 | Build status-widget                                                |

### Dependency order

```
Phase 0 (ADR + Diagrams) → Phase 1 (CLI Types + Zod) → Phase 2 (Layout Manager) → Phase 3 (Server Routes) → Phase 4 (UI) → Phase 5 (Reference Ext) → Phase 6 (Cleanup)
```
