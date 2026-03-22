import { useEffect, useRef } from 'react';

import type { ContextMenuState } from './types.js';

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ContextMenu({
  state,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: Readonly<ContextMenuProps>) {
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
