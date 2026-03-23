import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

import type { TreeNode, TreeEntry, OpenTab, ContextMenuState, InlineInputState } from './types.js';
import { ContextMenu } from './ContextMenu.js';
import { InlineInput } from './InlineInput.js';
import { Sidebar } from './Sidebar.js';
import { EditorArea } from './EditorArea.js';

// ── Pure helpers (module-level) ───────────────────────────────────────────

function updateNodeInTree(
  nodes: TreeNode[],
  path: string,
  updater: (node: TreeNode) => TreeNode,
): TreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) return updater(node);
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, path, updater) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: TreeNode[], targetPath: string): TreeNode[] {
  return nodes
    .filter((n) => n.path !== targetPath)
    .map((n) => ({
      ...n,
      children: n.children ? removeNodeFromTree(n.children, targetPath) : undefined,
    }));
}

function getNodeDepth(path: string): number {
  return path ? path.split('/').length : 0;
}

function createResizeListeners(
  startX: number,
  startWidth: number,
  resizingRef: React.RefObject<boolean>,
  setWidth: React.Dispatch<React.SetStateAction<number>>,
): { move: (e: MouseEvent) => void; up: () => void } {
  const move = (moveEvent: MouseEvent) => {
    if (!resizingRef.current) return;
    const diff = moveEvent.clientX - startX;
    setWidth(Math.max(180, Math.min(500, startWidth + diff)));
  };

  const up = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  };

  return { move, up };
}

// ── Hook: useResizeHandle ─────────────────────────────────────────────────

function useResizeHandle(initialWidth: number) {
  const [width, setWidth] = useState(initialWidth);
  const resizingRef = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizingRef.current = true;
      const { move, up } = createResizeListeners(e.clientX, width, resizingRef, setWidth);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    },
    [width],
  );

  return { width, onMouseDown };
}

// ── Hook: useFileTree ─────────────────────────────────────────────────────

function useFileTree(sdk: PanelProps['sdk'] | undefined, extName: string) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDirectory = useCallback(
    async (path: string): Promise<TreeNode[]> => {
      if (!sdk) return [];
      try {
        const result = await sdk.exec.run(`${extName}:tree`, { path });
        const entries = JSON.parse(result.output) as TreeEntry[];
        return entries.map((e) => ({
          ...e,
          loaded: e.type === 'file',
          expanded: false,
          children: e.type === 'directory' ? [] : undefined,
        }));
      } catch {
        return [];
      }
    },
    [sdk, extName],
  );

  const refreshDirectory = useCallback(
    async (parentPath: string) => {
      const nodes = await loadDirectory(parentPath);
      if (!parentPath) {
        setTreeNodes(nodes);
      } else {
        setTreeNodes((prev) =>
          updateNodeInTree(prev, parentPath, (n) => ({ ...n, children: nodes, loaded: true })),
        );
      }
    },
    [loadDirectory],
  );

  useEffect(() => {
    void loadDirectory('').then((nodes) => {
      setTreeNodes(nodes);
      setLoading(false);
    });
  }, [loadDirectory]);

  const handleToggle = useCallback(
    async (node: TreeNode) => {
      if (node.expanded) {
        setTreeNodes((prev) =>
          updateNodeInTree(prev, node.path, (n) => ({ ...n, expanded: false })),
        );
        return;
      }
      if (!node.loaded) {
        const children = await loadDirectory(node.path);
        setTreeNodes((prev) =>
          updateNodeInTree(prev, node.path, (n) => ({
            ...n,
            expanded: true,
            loaded: true,
            children,
          })),
        );
      } else {
        setTreeNodes((prev) =>
          updateNodeInTree(prev, node.path, (n) => ({ ...n, expanded: true })),
        );
      }
    },
    [loadDirectory],
  );

  return { treeNodes, setTreeNodes, loading, loadDirectory, refreshDirectory, handleToggle };
}

// ── Hook: useTabs ─────────────────────────────────────────────────────────

function useTabs(sdk: PanelProps['sdk'] | undefined, extName: string) {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);

  const activeTab =
    activeTabIndex >= 0 && activeTabIndex < tabs.length ? (tabs[activeTabIndex] ?? null) : null;

  const handleSelect = useCallback(
    async (node: TreeNode) => {
      const existingIndex = tabs.findIndex((t) => t.path === node.path);
      if (existingIndex >= 0) {
        setActiveTabIndex(existingIndex);
        return;
      }
      if (!sdk) return;
      try {
        const result = await sdk.exec.run(`${extName}:read`, { path: node.path });
        const data = JSON.parse(result.output) as {
          content: string;
          language: string;
          error?: string;
        };
        if (data.error) {
          sdk.ui.toast({ title: 'Error', description: data.error, variant: 'destructive' });
          return;
        }
        setTabs((prev) => [
          ...prev,
          {
            path: node.path,
            name: node.name,
            content: data.content,
            originalContent: data.content,
            language: data.language,
            modified: false,
          },
        ]);
        setActiveTabIndex(tabs.length);
      } catch {
        sdk.ui.toast({
          title: 'Error',
          description: 'Failed to open file',
          variant: 'destructive',
        });
      }
    },
    [sdk, extName, tabs],
  );

  const handleSave = useCallback(async () => {
    if (!activeTab || !sdk || !activeTab.modified) return;
    try {
      await sdk.exec.run(`${extName}:write`, {
        path: activeTab.path,
        content: activeTab.content,
      });
      setTabs((prev) =>
        prev.map((t, i) =>
          i === activeTabIndex ? { ...t, modified: false, originalContent: t.content } : t,
        ),
      );
      sdk.ui.toast({ title: 'Saved', description: activeTab.name });
    } catch {
      sdk.ui.toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  }, [activeTab, activeTabIndex, sdk, extName]);

  const handleTabClose = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (tab?.modified) {
        sdk?.ui.toast({
          title: 'Unsaved changes',
          description: `${tab.name} has unsaved changes`,
        });
      }
      setTabs((prev) => prev.filter((_, i) => i !== index));
      if (activeTabIndex >= index && activeTabIndex > 0) {
        setActiveTabIndex((prev) => prev - 1);
      } else if (tabs.length <= 1) {
        setActiveTabIndex(-1);
      }
    },
    [tabs, activeTabIndex, sdk],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setTabs((prev) =>
        prev.map((t, i) =>
          i === activeTabIndex
            ? { ...t, content: value, modified: value !== t.originalContent }
            : t,
        ),
      );
    },
    [activeTabIndex],
  );

  return {
    tabs,
    setTabs,
    activeTabIndex,
    setActiveTabIndex,
    activeTab,
    handleSelect,
    handleSave,
    handleTabClose,
    handleContentChange,
  };
}

// ── Hook: useContextMenuActions ───────────────────────────────────────────

interface ContextMenuDeps {
  sdk: PanelProps['sdk'] | undefined;
  extName: string;
  tabs: OpenTab[];
  handleTabClose: (index: number) => void;
  refreshDirectory: (parentPath: string) => Promise<void>;
  setTreeNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  setTabs: React.Dispatch<React.SetStateAction<OpenTab[]>>;
}

function useContextMenuActions(deps: ContextMenuDeps) {
  const { sdk, extName, tabs, handleTabClose, refreshDirectory, setTreeNodes, setTabs } = deps;
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [inlineInput, setInlineInput] = useState<InlineInputState | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    const parentPath =
      node.type === 'directory' ? node.path : node.path.split('/').slice(0, -1).join('/');
    setContextMenu({ x: e.clientX, y: e.clientY, node, parentPath });
  }, []);

  const handleTreeContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: null, parentPath: '' });
  }, []);

  const handleNewFile = useCallback(() => {
    const parentPath = contextMenu?.parentPath ?? '';
    setInlineInput({ type: 'new-file', parentPath, depth: getNodeDepth(parentPath) + 1 });
  }, [contextMenu]);

  const handleNewFolder = useCallback(() => {
    const parentPath = contextMenu?.parentPath ?? '';
    setInlineInput({ type: 'new-folder', parentPath, depth: getNodeDepth(parentPath) + 1 });
  }, [contextMenu]);

  const handleRename = useCallback(() => {
    if (!contextMenu?.node) return;
    const node = contextMenu.node;
    setInlineInput({
      type: 'rename',
      parentPath: node.path.split('/').slice(0, -1).join('/'),
      depth: getNodeDepth(node.path),
      originalPath: node.path,
      originalName: node.name,
    });
  }, [contextMenu]);

  const handleDelete = useCallback(async () => {
    if (!contextMenu?.node || !sdk) return;
    const node = contextMenu.node;
    try {
      await sdk.exec.run(`${extName}:delete`, { path: node.path });
      setTreeNodes((prev) => removeNodeFromTree(prev, node.path));
      const tabIdx = tabs.findIndex((t) => t.path === node.path);
      if (tabIdx >= 0) handleTabClose(tabIdx);
      sdk.ui.toast({ title: 'Deleted', description: node.name });
    } catch {
      sdk.ui.toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  }, [contextMenu, sdk, extName, tabs, handleTabClose, setTreeNodes]);

  const handleInlineSubmit = useCallback(
    async (value: string) => {
      if (!sdk || !inlineInput) return;
      const { type, parentPath, originalPath } = inlineInput;
      const newPath = parentPath ? `${parentPath}/${value}` : value;

      try {
        if (type === 'rename' && originalPath) {
          const oldParent = originalPath.split('/').slice(0, -1).join('/');
          const targetPath = oldParent ? `${oldParent}/${value}` : value;
          await sdk.exec.run(`${extName}:rename`, { oldPath: originalPath, newPath: targetPath });
          setTabs((prev) =>
            prev.map((t) =>
              t.path === originalPath ? { ...t, path: targetPath, name: value } : t,
            ),
          );
        } else {
          const fileType = type === 'new-file' ? 'file' : 'directory';
          await sdk.exec.run(`${extName}:create`, { path: newPath, type: fileType });
        }
        await refreshDirectory(parentPath);
      } catch {
        sdk.ui.toast({
          title: 'Error',
          description: `Failed to ${type}`,
          variant: 'destructive',
        });
      }
      setInlineInput(null);
    },
    [sdk, extName, inlineInput, refreshDirectory, setTabs],
  );

  return {
    contextMenu,
    setContextMenu,
    inlineInput,
    setInlineInput,
    handleContextMenu,
    handleTreeContextMenu,
    handleNewFile,
    handleNewFolder,
    handleRename,
    handleDelete,
    handleInlineSubmit,
  };
}

// ── Hook: useDragAndDrop ──────────────────────────────────────────────────

interface DragDropDeps {
  sdk: PanelProps['sdk'] | undefined;
  extName: string;
  refreshDirectory: (parentPath: string) => Promise<void>;
  setTabs: React.Dispatch<React.SetStateAction<OpenTab[]>>;
}

function useDragAndDrop(deps: DragDropDeps) {
  const { sdk, extName, refreshDirectory, setTabs } = deps;
  const [rootDragOver, setRootDragOver] = useState(false);

  const handleDrop = useCallback(
    async (sourcePath: string, targetDirPath: string) => {
      if (!sdk) return;
      const fileName = sourcePath.split('/').pop() ?? '';
      const newPath = targetDirPath ? `${targetDirPath}/${fileName}` : fileName;

      try {
        await sdk.exec.run(`${extName}:rename`, { oldPath: sourcePath, newPath });
        setTabs((prev) =>
          prev.map((t) => (t.path === sourcePath ? { ...t, path: newPath } : t)),
        );
        const sourceParent = sourcePath.split('/').slice(0, -1).join('/');
        await refreshDirectory(sourceParent);
        await refreshDirectory(targetDirPath);
        sdk.ui.toast({
          title: 'Moved',
          description: `${fileName} \u2192 ${targetDirPath || '/'}`,
        });
      } catch {
        sdk.ui.toast({ title: 'Error', description: 'Failed to move', variant: 'destructive' });
      }
    },
    [sdk, extName, refreshDirectory, setTabs],
  );

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setRootDragOver(true);
  }, []);

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setRootDragOver(false);
      const sourcePath = e.dataTransfer.getData('text/plain');
      if (sourcePath) {
        void handleDrop(sourcePath, '');
      }
    },
    [handleDrop],
  );

  return { rootDragOver, setRootDragOver, handleDrop, handleRootDragOver, handleRootDrop };
}

// ── Hook: useThemeDetection ───────────────────────────────────────────────

function useThemeDetection() {
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  const detectedTheme = useMemo(
    () =>
      typeof document === 'undefined' || document.documentElement.classList.contains('dark')
        ? 'vs-dark'
        : 'vs-light',
    [],
  );

  useEffect(() => {
    setTheme(detectedTheme);
  }, [detectedTheme]);

  return { theme, setTheme };
}

// ── Hook: useKeyboardShortcuts ────────────────────────────────────────────

function useKeyboardShortcuts(handleSave: () => Promise<void>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);
}

// ── Main Editor Panel ─────────────────────────────────────────────────────

export default function EditorPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'file-editor';
  const { width: sidebarWidth, onMouseDown: handleResizeMouseDown } = useResizeHandle(260);
  const fileTree = useFileTree(sdk, extName);
  const tabState = useTabs(sdk, extName);
  const { theme, setTheme } = useThemeDetection();

  const ctxMenu = useContextMenuActions({
    sdk,
    extName,
    tabs: tabState.tabs,
    handleTabClose: tabState.handleTabClose,
    refreshDirectory: fileTree.refreshDirectory,
    setTreeNodes: fileTree.setTreeNodes,
    setTabs: tabState.setTabs,
  });

  const dragDrop = useDragAndDrop({
    sdk,
    extName,
    refreshDirectory: fileTree.refreshDirectory,
    setTabs: tabState.setTabs,
  });

  useKeyboardShortcuts(tabState.handleSave);

  if (fileTree.loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Loading file tree...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-background">
      <Sidebar
        treeNodes={fileTree.treeNodes}
        sidebarWidth={sidebarWidth}
        rootDragOver={dragDrop.rootDragOver}
        activeFilePath={tabState.activeTab?.path ?? null}
        inlineInput={ctxMenu.inlineInput}
        onToggle={fileTree.handleToggle}
        onSelect={tabState.handleSelect}
        onContextMenu={ctxMenu.handleContextMenu}
        onDrop={dragDrop.handleDrop}
        onTreeContextMenu={ctxMenu.handleTreeContextMenu}
        onRootDragOver={dragDrop.handleRootDragOver}
        onRootDragLeave={() => dragDrop.setRootDragOver(false)}
        onRootDrop={dragDrop.handleRootDrop}
        onNewFile={() => ctxMenu.setInlineInput({ type: 'new-file', parentPath: '', depth: 0 })}
        onNewFolder={() =>
          ctxMenu.setInlineInput({ type: 'new-folder', parentPath: '', depth: 0 })
        }
        onRefresh={() => {
          void fileTree.refreshDirectory('');
        }}
        onInlineSubmit={ctxMenu.handleInlineSubmit}
        onInlineCancel={() => ctxMenu.setInlineInput(null)}
      />

      <div
        className="w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 flex-shrink-0"
        onMouseDown={handleResizeMouseDown}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <EditorArea
          tabs={tabState.tabs}
          activeTabIndex={tabState.activeTabIndex}
          activeTab={tabState.activeTab}
          theme={theme}
          onSelectTab={tabState.setActiveTabIndex}
          onCloseTab={tabState.handleTabClose}
          onContentChange={tabState.handleContentChange}
          onSave={tabState.handleSave}
          onToggleTheme={() => setTheme((t) => (t === 'vs-dark' ? 'vs-light' : 'vs-dark'))}
        />
      </div>

      {ctxMenu.contextMenu && (
        <ContextMenu
          state={ctxMenu.contextMenu}
          onClose={() => ctxMenu.setContextMenu(null)}
          onNewFile={ctxMenu.handleNewFile}
          onNewFolder={ctxMenu.handleNewFolder}
          onRename={ctxMenu.handleRename}
          onDelete={ctxMenu.handleDelete}
        />
      )}

      {ctxMenu.inlineInput?.originalPath && (
        <div className="fixed inset-0 z-40" onClick={() => ctxMenu.setInlineInput(null)}>
          <div
            className="absolute"
            style={{ left: sidebarWidth * 0.3, top: '50%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <InlineInput
              defaultValue={ctxMenu.inlineInput.originalName ?? ''}
              depth={0}
              onSubmit={ctxMenu.handleInlineSubmit}
              onCancel={() => ctxMenu.setInlineInput(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
