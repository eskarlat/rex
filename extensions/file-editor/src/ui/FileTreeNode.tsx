import { useState } from 'react';

import type { TreeNode } from './types.js';
import { getFileIcon } from './file-icons.js';

interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onDrop: (sourcePath: string, targetPath: string) => void;
  selectedPath: string | null;
}

export function FileTreeNode({
  node,
  depth,
  onToggle,
  onSelect,
  onContextMenu,
  onDrop,
  selectedPath,
}: Readonly<FileTreeNodeProps>) {
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
            {node.expanded ? '\u25BE' : '\u25B8'}
          </span>
        )}
        {node.type === 'file' && <span className="mr-1 w-3 inline-block" />}
        <span className="mr-1.5 text-sm">{getFileIcon(node.name, node.type, node.expanded)}</span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.type === 'directory' && node.expanded && node.children?.map((child: TreeNode) => (
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
