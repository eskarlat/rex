import type { RefObject } from 'react';
import {
  Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@renre-kit/extension-sdk/components';

import type { NetworkEntry } from '../shared/types.js';

function statusColor(status: number): string {
  if (status >= 500) return '#ef4444';
  if (status >= 400) return '#eab308';
  if (status >= 300) return '#3b82f6';
  return '#22c55e';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i] ?? 'GB'}`;
}

interface NetworkLogViewProps {
  entries: NetworkEntry[];
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function NetworkLogView({ entries, scrollRef }: Readonly<NetworkLogViewProps>) {
  return (
    <div ref={scrollRef} style={{ maxHeight: '500px', overflow: 'auto' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', color: 'var(--muted-foreground, #94a3b8)' }}>
                No network requests yet
              </TableCell>
            </TableRow>
          ) : entries.map((entry, i) => (
            <TableRow key={i}>
              <TableCell style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
              <TableCell><Badge variant="outline">{entry.method}</Badge></TableCell>
              <TableCell style={{ color: statusColor(entry.status) }}>{entry.status}</TableCell>
              <TableCell style={{ fontSize: '12px' }}>{entry.type}</TableCell>
              <TableCell style={{ fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.url}>{entry.url}</TableCell>
              <TableCell style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatBytes(entry.size)}</TableCell>
              <TableCell style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{entry.duration}ms</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
