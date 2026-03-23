import { Button, ScrollArea, ScrollBar } from '@renre-kit/extension-sdk/components';

import type { BrowserTab } from '../hooks/useTabManager.js';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: Readonly<TabBarProps>) {
  return (
    <div className="flex items-center border-b bg-muted/30 min-h-[36px]">
      <ScrollArea className="flex-1">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = tab.targetId === activeTabId;
            return (
              <div
                key={tab.targetId}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                onClick={() => onTabSelect(tab.targetId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTabSelect(tab.targetId);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border-r max-w-[200px] cursor-pointer ${
                  isActive
                    ? 'bg-background border-b-0 rounded-t-md text-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: domainColor(tab.url) }}
                />
                <span className="truncate">{tab.title || 'New Tab'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.targetId);
                  }}
                  className="ml-1 hover:text-destructive flex-shrink-0"
                  aria-label={`Close ${tab.title}`}
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button variant="ghost" size="sm" onClick={onNewTab} className="mx-1 h-6 w-6 p-0 text-xs">
        +
      </Button>
    </div>
  );
}

function domainColor(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    let hash = 0;
    for (let i = 0; i < hostname.length; i++) {
      hash = hostname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${String(hue)}, 60%, 50%)`;
  } catch {
    return '#888';
  }
}
