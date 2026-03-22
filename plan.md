# Plan: File Editor Extension

## Overview
VS Code-like file editor extension for RenreKit dashboard. Single panel with resizable file tree sidebar + tabbed Monaco Editor. Full CRUD, lazy tree loading, drag-and-drop file moves.

## Extension Structure

```
extensions/file-editor/
├── manifest.json
├── build.js
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # onInit/onDestroy hooks
│   ├── commands/
│   │   ├── tree.ts                 # List directory (lazy, respects .gitignore)
│   │   ├── read.ts                 # Read file content
│   │   ├── write.ts                # Write/save file content
│   │   ├── create.ts               # Create file or folder
│   │   ├── delete.ts               # Delete file or folder
│   │   └── rename.ts               # Rename/move file or folder
│   └── ui/
│       └── editor-panel.tsx        # Single panel: file tree + Monaco editor
```

## Implementation Steps

### Step 1: Scaffold extension
- `package.json` with `@monaco-editor/react`, `react-arborist`
- `manifest.json` with 6 commands + 1 panel
- `build.js` using SDK's `buildExtension` + `buildPanel`
- `tsconfig.json`

### Step 2: CLI Commands
All use `defineCommand()` with Zod validation, path-scoped to project dir.

1. **`file-editor:tree`** — `{ path, depth? }` → `{ name, path, type, children? }[]`
2. **`file-editor:read`** — `{ path }` → `{ content, language }`
3. **`file-editor:write`** — `{ path, content }` → writes file
4. **`file-editor:create`** — `{ path, type: 'file'|'directory' }` → creates
5. **`file-editor:delete`** — `{ path }` → deletes (recursive for dirs)
6. **`file-editor:rename`** — `{ oldPath, newPath }` → moves/renames

### Step 3: UI Panel
Single `editor-panel.tsx`:
- Resizable split layout
- File tree (react-arborist) with lazy loading, context menu, drag-and-drop
- Monaco Editor with tabs, themes, Ctrl+S save, language detection
- Unsaved file indicators

### Step 4: Build & verify
- `node build.js` → dist/ bundles
- Mark `monaco-editor` and `react-arborist` as panel externals or use CDN approach

## Security
- All paths validated within project directory
- No symlink following outside project
- File size limit (~5MB) for reads
