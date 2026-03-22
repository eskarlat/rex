import type { TreeNode, InlineInputState } from './types.js';
import { FileTreeNode } from './FileTreeNode.js';
import { InlineInput } from './InlineInput.js';

interface SidebarProps {
  treeNodes: TreeNode[];
  sidebarWidth: number;
  rootDragOver: boolean;
  activeFilePath: string | null;
  inlineInput: InlineInputState | null;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onDrop: (sourcePath: string, targetPath: string) => void;
  onTreeContextMenu: (e: React.MouseEvent) => void;
  onRootDragOver: (e: React.DragEvent) => void;
  onRootDragLeave: () => void;
  onRootDrop: (e: React.DragEvent) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onInlineSubmit: (value: string) => void;
  onInlineCancel: () => void;
}

export function Sidebar({
  treeNodes,
  sidebarWidth,
  rootDragOver,
  activeFilePath,
  inlineInput,
  onToggle,
  onSelect,
  onContextMenu,
  onDrop,
  onTreeContextMenu,
  onRootDragOver,
  onRootDragLeave,
  onRootDrop,
  onNewFile,
  onNewFolder,
  onRefresh,
  onInlineSubmit,
  onInlineCancel,
}: Readonly<SidebarProps>) {
  return (
    <div
      className="flex flex-col border-r bg-muted/20 overflow-hidden"
      style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
            title="New File"
            onClick={onNewFile}
          >
            +
          </button>
          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
            title="New Folder"
            onClick={onNewFolder}
          >
            {'\uD83D\uDCC1'}
          </button>
          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
            title="Refresh"
            onClick={onRefresh}
          >
            {'\u21BB'}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-auto py-1 ${rootDragOver ? 'bg-primary/10' : ''}`}
        onContextMenu={onTreeContextMenu}
        onDragOver={onRootDragOver}
        onDragLeave={onRootDragLeave}
        onDrop={onRootDrop}
      >
        {treeNodes.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            onToggle={onToggle}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
            onDrop={onDrop}
            selectedPath={activeFilePath}
          />
        ))}
        {inlineInput && !inlineInput.originalPath && (
          <InlineInput
            defaultValue=""
            depth={inlineInput.depth}
            onSubmit={onInlineSubmit}
            onCancel={onInlineCancel}
          />
        )}
        {treeNodes.length === 0 && !inlineInput && (
          <div className="text-sm text-muted-foreground text-center py-8 px-4">
            No files found.
          </div>
        )}
      </div>
    </div>
  );
}
