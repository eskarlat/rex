import { useEffect, useRef } from 'react';
import { Button, ScrollArea } from '@renre-kit/extension-sdk/components';

import type { ConsoleEntry } from '../hooks/useConsole.js';

interface ConsolePanelProps {
  logs: ConsoleEntry[];
  onClear: () => void;
}

const LEVEL_STYLES: Record<string, string> = {
  info: 'text-muted-foreground',
  log: 'text-muted-foreground',
  warn: 'text-yellow-500',
  warning: 'text-yellow-500',
  error: 'text-destructive',
};

export function ConsolePanel({ logs, onClear }: Readonly<ConsolePanelProps>) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="text-xs text-muted-foreground">{logs.length} entries</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-5 text-xs px-2">
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 font-mono text-xs space-y-0.5">
          {logs.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No console output</p>
          )}
          {logs.map((entry, i) => (
            <div key={i} className={`flex gap-2 ${LEVEL_STYLES[entry.level] ?? 'text-foreground'}`}>
              <span className="text-muted-foreground flex-shrink-0 w-16">{formatTime(entry.timestamp)}</span>
              <span className="flex-shrink-0 w-10">[{entry.level}]</span>
              <span className="break-all">{entry.text}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return timestamp.slice(0, 8);
  }
}
