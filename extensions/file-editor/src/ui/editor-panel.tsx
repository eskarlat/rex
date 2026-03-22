import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

// ── Types ──────────────────────────────────────────────────────────────────

interface TreeEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
}

interface TreeNode extends TreeEntry {
  children?: TreeNode[];
  loaded?: boolean;
  expanded?: boolean;
}

interface OpenTab {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  language: string;
  modified: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode | null;
  parentPath: string;
}

// ── File Icons ─────────────────────────────────────────────────────────────

const FILE_ICONS: Record<string, string> = {
  ts: '🟦', tsx: '⚛️', js: '🟨', jsx: '⚛️', json: '📋', md: '📝',
  css: '🎨', scss: '🎨', html: '🌐', svg: '🖼️', png: '🖼️', jpg: '🖼️',
  py: '🐍', rb: '💎', rs: '🦀', go: '🐹', java: '☕', sh: '🐚',
  yaml: '⚙️', yml: '⚙️', toml: '⚙️', sql: '🗄️', dockerfile: '🐳',
  gitignore: '📂', env: '🔒', lock: '🔒',
};

function getFileIcon(name: string, type: 'file' | 'directory', expanded?: boolean): string {
  if (type === 'directory') return expanded ? '📂' : '📁';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? '📄';
}

// ── File Tree Component ────────────────────────────────────────────────────

function FileTreeNode({
  node,
  depth,
  onToggle,
  onSelect,
  onContextMenu,
  onDrop,
  selectedPath,
}: Readonly<{
  node: TreeNode;
  depth: number;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onDrop: (sourcePath: string, targetPath: string) => void;
  selectedPath: string | null;
}>) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (node.type !== 'directory') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const sourcePath = e.dataTransfer.getData('text/plain');
    if (sourcePath && sourcePath !== node.path && node.type === 'directory') {
      onDrop(sourcePath, node.path);
    }
  };

  const handleClick = () => {
    if (node.type === 'directory') {
      onToggle(node);
    } else {
      onSelect(node);
    }
  };

  const isSelected = selectedPath === node.path;

  return (
    <>
      <div
        className={`flex items-center cursor-pointer select-none hover:bg-accent/50 ${isSelected ? 'bg-accent text-accent-foreground' : ''} ${dragOver ? 'bg-primary/20 outline outline-1 outline-primary' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px`, height: '28px' }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {node.type === 'directory' && (
          <span className="mr-1 text-xs text-muted-foreground w-3 inline-block">
            {node.expanded ? '▾' : '▸'}
          </span>
        )}
        {node.type === 'file' && <span className="mr-1 w-3 inline-block" />}
        <span className="mr-1.5 text-sm">{getFileIcon(node.name, node.type, node.expanded)}</span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.type === 'directory' && node.expanded && node.children?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          onToggle={onToggle}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          onDrop={onDrop}
          selectedPath={selectedPath}
        />
      ))}
    </>
  );
}

// ── Context Menu ───────────────────────────────────────────────────────────

function ContextMenu({
  state,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: Readonly<{
  state: ContextMenuState;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md"
      style={{ left: state.x, top: state.y }}
    >
      <button
        className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => { onNewFile(); onClose(); }}
      >
        New File
      </button>
      <button
        className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => { onNewFolder(); onClose(); }}
      >
        New Folder
      </button>
      <div className="h-px my-1 bg-border" />
      {state.node && (
        <>
          <button
            className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => { onRename(); onClose(); }}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm rounded-sm text-destructive hover:bg-destructive/10"
            onClick={() => { onDelete(); onClose(); }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

// ── Inline Input (for new file/folder/rename) ──────────────────────────────

function InlineInput({
  defaultValue,
  onSubmit,
  onCancel,
  depth,
}: Readonly<{
  defaultValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  depth: number;
}>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = inputRef.current?.value.trim();
      if (value) onSubmit(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 16 + 8}px`, height: '28px' }} className="flex items-center">
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="h-6 w-full bg-background border border-primary rounded px-1 text-sm focus:outline-none"
      />
    </div>
  );
}

// ── Tab Bar ────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeIndex,
  onSelect,
  onClose,
}: Readonly<{
  tabs: OpenTab[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: (index: number) => void;
}>) {
  return (
    <div className="flex items-center border-b bg-muted/30 overflow-x-auto">
      {tabs.map((tab, i) => (
        <div
          key={tab.path}
          className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer border-r border-b-2 select-none whitespace-nowrap ${
            i === activeIndex
              ? 'bg-background border-b-primary text-foreground'
              : 'bg-muted/30 border-b-transparent text-muted-foreground hover:bg-muted/60'
          }`}
          onClick={() => onSelect(i)}
        >
          <span className="text-xs">{getFileIcon(tab.name, 'file')}</span>
          <span>{tab.name}</span>
          {tab.modified && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
          <button
            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded px-0.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onClose(i); }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Simple Code Editor (textarea-based, Monaco loaded dynamically) ─────────

function CodeEditor({
  content,
  language,
  onChange,
  onSave,
  theme,
}: Readonly<{
  content: string;
  language: string;
  onChange: (value: string) => void;
  onSave: () => void;
  theme: 'vs-dark' | 'vs-light';
}>) {
  const [MonacoEditor, setMonacoEditor] = useState<React.ComponentType<MonacoEditorProps> | null>(null);
  const [monacoError, setMonacoError] = useState(false);

  useEffect(() => {
    import('https://cdn.jsdelivr.net/npm/@monaco-editor/react@4.7.0/+esm')
      .then((mod) => {
        setMonacoEditor(() => (mod.default ?? mod.Editor) as React.ComponentType<MonacoEditorProps>);
      })
      .catch(() => {
        setMonacoError(true);
      });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    },
    [onSave],
  );

  if (MonacoEditor && !monacoError) {
    return (
      <div className="h-full" onKeyDown={handleKeyDown}>
        <MonacoEditor
          height="100%"
          language={language}
          value={content}
          theme={theme}
          onChange={(val: string | undefined) => onChange(val ?? '')}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on' as const,
            wordWrap: 'on' as const,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    );
  }

  // Fallback textarea editor
  return (
    <textarea
      className={`w-full h-full resize-none font-mono text-sm p-4 focus:outline-none ${
        theme === 'vs-dark' ? 'bg-[#1e1e1e] text-[#d4d4d4]' : 'bg-white text-[#1e1e1e]'
      }`}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
    />
  );
}

interface MonacoEditorProps {
  height: string;
  language: string;
  value: string;
  theme: string;
  onChange: (val: string | undefined) => void;
  options: Record<string, unknown>;
}

// ── Main Editor Panel ──────────────────────────────────────────────────────

export default function EditorPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [inlineInput, setInlineInput] = useState<{
    type: 'new-file' | 'new-folder' | 'rename';
    parentPath: string;
    depth: number;
    originalPath?: string;
    originalName?: string;
  } | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const resizingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const extName = extensionName ?? 'file-editor';
  const activeTab = activeTabIndex >= 0 && activeTabIndex < tabs.length ? tabs[activeTabIndex] : null;

  // ── Load root tree ─────────────────────────────────────────────────────

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

  useEffect(() => {
    loadDirectory('').then((nodes) => {
      setTreeNodes(nodes);
      setLoading(false);
    });
  }, [loadDirectory]);

  // ── Tree operations ────────────────────────────────────────────────────

  const updateNodeInTree = useCallback(
    (nodes: TreeNode[], path: string, updater: (node: TreeNode) => TreeNode): TreeNode[] => {
      return nodes.map((node) => {
        if (node.path === path) return updater(node);
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children, path, updater) };
        }
        return node;
      });
    },
    [],
  );

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
    [loadDirectory, updateNodeInTree],
  );

  // ── Open file ──────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    async (node: TreeNode) => {
      // Check if already open
      const existingIndex = tabs.findIndex((t) => t.path === node.path);
      if (existingIndex >= 0) {
        setActiveTabIndex(existingIndex);
        return;
      }

      if (!sdk) return;
      try {
        const result = await sdk.exec.run(`${extName}:read`, { path: node.path });
        const data = JSON.parse(result.output) as { content: string; language: string; error?: string };
        if (data.error) {
          sdk.ui.toast({ title: 'Error', description: data.error, variant: 'destructive' });
          return;
        }

        const newTab: OpenTab = {
          path: node.path,
          name: node.name,
          content: data.content,
          originalContent: data.content,
          language: data.language,
          modified: false,
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTabIndex(tabs.length);
      } catch {
        sdk.ui.toast({ title: 'Error', description: 'Failed to open file', variant: 'destructive' });
      }
    },
    [sdk, extName, tabs],
  );

  // ── Save file ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!activeTab || !sdk || !activeTab.modified) return;

    try {
      await sdk.exec.run(`${extName}:write`, {
        path: activeTab.path,
        content: activeTab.content,
      });

      setTabs((prev) =>
        prev.map((t, i) =>
          i === activeTabIndex
            ? { ...t, modified: false, originalContent: t.content }
            : t,
        ),
      );

      sdk.ui.toast({ title: 'Saved', description: activeTab.name });
    } catch {
      sdk.ui.toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  }, [activeTab, activeTabIndex, sdk, extName]);

  // ── Tab operations ─────────────────────────────────────────────────────

  const handleTabClose = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (tab?.modified) {
        // Simple confirm via SDK
        sdk?.ui.toast({ title: 'Unsaved changes', description: `${tab.name} has unsaved changes` });
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

  // ── Context menu actions ───────────────────────────────────────────────

  const handleContextMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    const parentPath = node.type === 'directory' ? node.path : node.path.split('/').slice(0, -1).join('/');
    setContextMenu({ x: e.clientX, y: e.clientY, node, parentPath });
  }, []);

  const handleTreeContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: null, parentPath: '' });
  }, []);

  const getNodeDepth = useCallback((path: string): number => {
    if (!path) return 0;
    return path.split('/').length;
  }, []);

  const handleNewFile = useCallback(() => {
    const parentPath = contextMenu?.parentPath ?? '';
    setInlineInput({
      type: 'new-file',
      parentPath,
      depth: getNodeDepth(parentPath) + 1,
    });
  }, [contextMenu, getNodeDepth]);

  const handleNewFolder = useCallback(() => {
    const parentPath = contextMenu?.parentPath ?? '';
    setInlineInput({
      type: 'new-folder',
      parentPath,
      depth: getNodeDepth(parentPath) + 1,
    });
  }, [contextMenu, getNodeDepth]);

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
  }, [contextMenu, getNodeDepth]);

  const handleDelete = useCallback(async () => {
    if (!contextMenu?.node || !sdk) return;
    const node = contextMenu.node;

    try {
      await sdk.exec.run(`${extName}:delete`, { path: node.path });

      // Remove from tree
      const removeFromTree = (nodes: TreeNode[]): TreeNode[] =>
        nodes.filter((n) => n.path !== node.path).map((n) => ({
          ...n,
          children: n.children ? removeFromTree(n.children) : undefined,
        }));
      setTreeNodes(removeFromTree);

      // Close tab if open
      const tabIdx = tabs.findIndex((t) => t.path === node.path);
      if (tabIdx >= 0) handleTabClose(tabIdx);

      sdk.ui.toast({ title: 'Deleted', description: node.name });
    } catch {
      sdk.ui.toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  }, [contextMenu, sdk, extName, tabs, handleTabClose]);

  const handleInlineSubmit = useCallback(
    async (value: string) => {
      if (!sdk || !inlineInput) return;

      const { type, parentPath, originalPath } = inlineInput;
      const newPath = parentPath ? `${parentPath}/${value}` : value;

      try {
        if (type === 'new-file') {
          await sdk.exec.run(`${extName}:create`, { path: newPath, type: 'file' });
        } else if (type === 'new-folder') {
          await sdk.exec.run(`${extName}:create`, { path: newPath, type: 'directory' });
        } else if (type === 'rename' && originalPath) {
          const oldParent = originalPath.split('/').slice(0, -1).join('/');
          const targetPath = oldParent ? `${oldParent}/${value}` : value;
          await sdk.exec.run(`${extName}:rename`, { oldPath: originalPath, newPath: targetPath });

          // Update tabs that reference old path
          setTabs((prev) =>
            prev.map((t) =>
              t.path === originalPath ? { ...t, path: targetPath, name: value } : t,
            ),
          );
        }

        // Refresh the parent directory
        const parentNodes = await loadDirectory(parentPath);
        if (!parentPath) {
          setTreeNodes(parentNodes);
        } else {
          setTreeNodes((prev) =>
            updateNodeInTree(prev, parentPath, (n) => ({
              ...n,
              children: parentNodes,
              loaded: true,
              expanded: true,
            })),
          );
        }
      } catch {
        sdk.ui.toast({ title: 'Error', description: `Failed to ${type}`, variant: 'destructive' });
      }

      setInlineInput(null);
    },
    [sdk, extName, inlineInput, loadDirectory, updateNodeInTree],
  );

  // ── Drag and drop ─────────────────────────────────────────────────────

  const handleDrop = useCallback(
    async (sourcePath: string, targetDirPath: string) => {
      if (!sdk) return;
      const fileName = sourcePath.split('/').pop() ?? '';
      const newPath = `${targetDirPath}/${fileName}`;

      try {
        await sdk.exec.run(`${extName}:rename`, { oldPath: sourcePath, newPath });

        // Update tabs
        setTabs((prev) =>
          prev.map((t) => (t.path === sourcePath ? { ...t, path: newPath } : t)),
        );

        // Refresh both source parent and target
        const sourceParent = sourcePath.split('/').slice(0, -1).join('/');
        const refreshParent = async (parentPath: string) => {
          const nodes = await loadDirectory(parentPath);
          if (!parentPath) {
            setTreeNodes(nodes);
          } else {
            setTreeNodes((prev) =>
              updateNodeInTree(prev, parentPath, (n) => ({
                ...n,
                children: nodes,
                loaded: true,
              })),
            );
          }
        };
        await refreshParent(sourceParent);
        await refreshParent(targetDirPath);

        sdk.ui.toast({ title: 'Moved', description: `${fileName} → ${targetDirPath}` });
      } catch {
        sdk.ui.toast({ title: 'Error', description: 'Failed to move', variant: 'destructive' });
      }
    },
    [sdk, extName, loadDirectory, updateNodeInTree],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // ── Sidebar resize ────────────────────────────────────────────────────

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(500, startWidth + diff));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  // ── Root drop zone ────────────────────────────────────────────────────

  const [rootDragOver, setRootDragOver] = useState(false);

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
        const fileName = sourcePath.split('/').pop() ?? '';
        handleDrop(sourcePath, '').catch(() => {});
        void fileName;
      }
    },
    [handleDrop],
  );

  // ── Detect dashboard theme ────────────────────────────────────────────

  const detectedTheme = useMemo(() => {
    if (typeof document === 'undefined') return 'vs-dark';
    return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light';
  }, []);

  useEffect(() => {
    setTheme(detectedTheme as 'vs-dark' | 'vs-light');
  }, [detectedTheme]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Loading file tree...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className="flex flex-col border-r bg-muted/20 overflow-hidden"
        style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explorer
          </span>
          <div className="flex gap-1">
            <button
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
              title="New File"
              onClick={() => {
                setInlineInput({ type: 'new-file', parentPath: '', depth: 0 });
              }}
            >
              +
            </button>
            <button
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
              title="New Folder"
              onClick={() => {
                setInlineInput({ type: 'new-folder', parentPath: '', depth: 0 });
              }}
            >
              📁
            </button>
            <button
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
              title="Refresh"
              onClick={() => {
                loadDirectory('').then(setTreeNodes);
              }}
            >
              ↻
            </button>
          </div>
        </div>

        {/* File tree */}
        <div
          className={`flex-1 overflow-auto py-1 ${rootDragOver ? 'bg-primary/10' : ''}`}
          onContextMenu={handleTreeContextMenu}
          onDragOver={handleRootDragOver}
          onDragLeave={() => setRootDragOver(false)}
          onDrop={handleRootDrop}
        >
          {treeNodes.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              onToggle={handleToggle}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
              onDrop={handleDrop}
              selectedPath={activeTab?.path ?? null}
            />
          ))}
          {inlineInput && !inlineInput.originalPath && (
            <InlineInput
              defaultValue=""
              depth={inlineInput.depth}
              onSubmit={handleInlineSubmit}
              onCancel={() => setInlineInput(null)}
            />
          )}
          {treeNodes.length === 0 && !inlineInput && (
            <div className="text-sm text-muted-foreground text-center py-8 px-4">
              No files found.
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 flex-shrink-0"
        onMouseDown={handleResizeMouseDown}
      />

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tabs.length > 0 ? (
          <>
            {/* Tab bar */}
            <TabBar
              tabs={tabs}
              activeIndex={activeTabIndex}
              onSelect={setActiveTabIndex}
              onClose={handleTabClose}
            />

            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-3 py-1 border-b bg-muted/20">
              <span className="text-xs text-muted-foreground truncate">
                {activeTab?.path}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {activeTab?.language}
                </span>
                <button
                  className="text-xs px-2 py-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme((t) => (t === 'vs-dark' ? 'vs-light' : 'vs-dark'))}
                >
                  {theme === 'vs-dark' ? '☀️' : '🌙'}
                </button>
                <button
                  className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={!activeTab?.modified}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Code editor */}
            <div className="flex-1 overflow-hidden">
              {activeTab && (
                <CodeEditor
                  content={activeTab.content}
                  language={activeTab.language}
                  onChange={handleContentChange}
                  onSave={handleSave}
                  theme={theme}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="text-6xl">📝</div>
            <div className="text-lg font-medium">No file open</div>
            <div className="text-sm">Select a file from the explorer to start editing</div>
            <div className="text-xs text-muted-foreground/60 mt-4 space-y-1 text-center">
              <div>Ctrl+S — Save file</div>
              <div>Right-click — Context menu</div>
              <div>Drag & drop — Move files</div>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={() => setContextMenu(null)}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}

      {/* Inline rename input */}
      {inlineInput?.originalPath && (
        <div className="fixed inset-0 z-40" onClick={() => setInlineInput(null)}>
          <div
            className="absolute"
            style={{ left: sidebarWidth * 0.3, top: '50%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <InlineInput
              defaultValue={inlineInput.originalName ?? ''}
              depth={0}
              onSubmit={handleInlineSubmit}
              onCancel={() => setInlineInput(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
