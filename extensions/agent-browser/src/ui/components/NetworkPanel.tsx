import { Button, ScrollArea } from '@renre-kit/extension-sdk/components';

import type { NetworkEntry } from '../hooks/useNetwork.js';

interface NetworkPanelProps {
  requests: NetworkEntry[];
  onClear: () => void;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-500';
  if (status >= 300 && status < 400) return 'text-yellow-500';
  return 'text-destructive';
}

function methodBadge(method: string): string {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-500',
    POST: 'bg-emerald-500/10 text-emerald-500',
    PUT: 'bg-yellow-500/10 text-yellow-500',
    DELETE: 'bg-destructive/10 text-destructive',
    PATCH: 'bg-purple-500/10 text-purple-500',
  };
  return colors[method] ?? 'bg-muted text-muted-foreground';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function NetworkPanel({ requests, onClear }: Readonly<NetworkPanelProps>) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="text-xs text-muted-foreground">{requests.length} requests</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-5 text-xs px-2">
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {requests.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-xs">No network requests</p>
          )}
          {requests.map((req, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${methodBadge(req.method)}`}>
                {req.method}
              </span>
              <span className={`font-mono flex-shrink-0 w-8 text-right ${statusColor(req.status)}`}>
                {req.status || '---'}
              </span>
              <span className="font-mono truncate flex-1 text-muted-foreground">{req.url}</span>
              <span className="text-muted-foreground flex-shrink-0 w-12 text-right">
                {req.duration ? `${String(req.duration)}ms` : ''}
              </span>
              <span className="text-muted-foreground flex-shrink-0 w-12 text-right">
                {req.size ? formatSize(req.size) : ''}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
