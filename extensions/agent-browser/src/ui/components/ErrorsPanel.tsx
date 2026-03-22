import { useState } from 'react';
import { Button, ScrollArea } from '@renre-kit/extension-sdk/components';

import type { ErrorEntry } from '../hooks/useErrors.js';

interface ErrorsPanelProps {
  errors: ErrorEntry[];
  onClear: () => void;
}

export function ErrorsPanel({ errors, onClear }: Readonly<ErrorsPanelProps>) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="text-xs text-muted-foreground">{errors.length} errors</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-5 text-xs px-2">
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {errors.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-xs">No page errors</p>
          )}
          {errors.map((error, i) => (
            <ErrorItem key={i} error={error} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ErrorItem({ error }: Readonly<{ error: ErrorEntry }>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md p-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-start gap-2 w-full text-left"
      >
        <span className="text-destructive text-xs mt-0.5">{expanded ? 'v' : '>'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-destructive font-medium break-all">{error.message}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(error.timestamp)}</p>
        </div>
      </button>
      {expanded && error.stack && (
        <pre className="mt-2 p-2 bg-muted rounded text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
          {error.stack}
        </pre>
      )}
    </div>
  );
}

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return timestamp;
  }
}
