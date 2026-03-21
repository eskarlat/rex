import { useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import { useAutoScroll, useScrollToBottom, useStreamLifecycle } from '../hooks';

import { LogEntry } from './LogEntry';
import { LogToolbar } from './LogToolbar';
import { LogFooter } from './LogFooter';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { useLogSocket } from '@/core/api/websocket';

export function ExtensionLogsTab() {
  const stream = useLogSocket();
  const { messages, connected, clear } = stream;
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useStreamLifecycle(stream, '/api/logs/entries');
  useAutoScroll(scrollRef, messages.length, autoScroll);
  const scrollToBottom = useScrollToBottom(scrollRef);

  const filtered = useMemo(() => {
    let result = messages;
    if (levelFilter !== 'all') {
      result = result.filter((m) => m.level === levelFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.msg.toLowerCase().includes(q) || (m.source?.toLowerCase().includes(q) ?? false),
      );
    }
    return result;
  }, [messages, levelFilter, search]);

  const levelSelect = (
    <Select value={levelFilter} onValueChange={setLevelFilter}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All levels</SelectItem>
        <SelectItem value="debug">Debug</SelectItem>
        <SelectItem value="info">Info</SelectItem>
        <SelectItem value="warn">Warn</SelectItem>
        <SelectItem value="error">Error</SelectItem>
      </SelectContent>
    </Select>
  );

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
        placeholder="Search logs..."
        extra={levelSelect}
      />

      <Card className="flex-1 overflow-hidden min-h-0 rounded-lg">
        <div className="h-full overflow-auto" ref={scrollRef}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
              <Search className="size-8 opacity-30" />
              <span className="text-sm">
                {connected ? 'Waiting for log events...' : 'Not connected to log stream'}
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] pl-3">Time</TableHead>
                  <TableHead className="w-[80px]">Level</TableHead>
                  <TableHead className="w-[120px]">Source</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <LogEntry key={`${log.time}-${log.source ?? ''}-${log.msg}`} log={log} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <LogFooter
          filteredCount={filtered.length}
          totalCount={messages.length}
          unit="log"
          unitPlural="logs"
        />
      </Card>
    </>
  );
}
