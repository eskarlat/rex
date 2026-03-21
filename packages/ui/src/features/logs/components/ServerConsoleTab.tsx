import { useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import { useAutoScroll, useScrollToBottom, useStreamLifecycle } from '../hooks';
import { formatTime } from '../constants';

import { LogToolbar } from './LogToolbar';
import { LogFooter } from './LogFooter';

import { cn } from '@/lib/utils';
import { useConsoleSocket } from '@/core/api/websocket';
import { Card, CardContent } from '@/components/ui/card';

const CONSOLE_LEVEL_COLORS: Record<string, string> = {
  error: 'text-red-600 dark:text-red-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  debug: 'text-muted-foreground',
};

export function ServerConsoleTab() {
  const stream = useConsoleSocket();
  const { messages, connected, clear } = stream;
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useStreamLifecycle(stream, '/api/logs/console/entries');
  useAutoScroll(scrollRef, messages.length, autoScroll);
  const scrollToBottom = useScrollToBottom(scrollRef);

  const filtered = useMemo(() => {
    if (!search) return messages;
    const q = search.toLowerCase();
    return messages.filter((m) => m.msg.toLowerCase().includes(q));
  }, [messages, search]);

  return (
    <>
      <LogToolbar
        search={search}
        onSearchChange={setSearch}
        autoScroll={autoScroll}
        onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
        onClear={clear}
        onScrollToBottom={scrollToBottom}
        connected={connected}
        placeholder="Search console output..."
      />

      <Card className="flex-1 overflow-hidden min-h-0 rounded-lg bg-muted/30">
        <CardContent className="h-full p-0">
          <div className="h-full overflow-auto font-mono text-xs" ref={scrollRef}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
                <Search className="size-8 opacity-30" />
                <span className="text-sm font-sans">
                  {connected
                    ? 'Waiting for console output...'
                    : 'Not connected to console stream'}
                </span>
              </div>
            ) : (
              filtered.map((entry, i) => (
                <div
                  key={`${entry.time}-${i}`}
                  className="flex items-start gap-3 border-b px-3 py-1.5 hover:bg-muted/50"
                >
                  <span className="shrink-0 text-muted-foreground w-[72px]">
                    {formatTime(entry.time)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 w-12 font-semibold uppercase',
                      CONSOLE_LEVEL_COLORS[entry.level] ?? 'text-foreground',
                    )}
                  >
                    {entry.level}
                  </span>
                  <span className="flex-1 break-all text-foreground">{entry.msg}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <LogFooter
          filteredCount={filtered.length}
          totalCount={messages.length}
          unit="entry"
          unitPlural="entries"
        />
      </Card>
    </>
  );
}
