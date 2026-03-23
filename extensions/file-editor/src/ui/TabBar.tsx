import type { OpenTab } from './types.js';
import { getFileIcon } from './file-icons.js';

interface TabBarProps {
  tabs: OpenTab[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: (index: number) => void;
}

export function TabBar({
  tabs,
  activeIndex,
  onSelect,
  onClose,
}: Readonly<TabBarProps>) {
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
            aria-label={`Close ${tab.name}`}
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
