import { useEffect, useRef, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogSocket, useConsoleSocket, type LogMessage, type ConsoleMessage } from '@/core/api/websocket';
import { useSettings } from '@/core/hooks/use-settings';
import { fetchApi } from '@/core/api/client';
import { cn } from '@/lib/utils';

const LEVEL_COLORS: Record<string, string> = {
  debug: 'bg-muted text-muted-foreground',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

function LogEntry({ log }: { log: LogMessage }) {
  const [expanded, setExpanded] = useState(false);
  const hasData = log.data && Object.keys(log.data).length > 0;

  return (
    <div
      role={hasData ? 'button' : undefined}
      tabIndex={hasData ? 0 : undefined}
      className={cn(
        'flex items-start gap-2 border-b px-3 py-2 text-sm font-mono',
        hasData && 'cursor-pointer hover:bg-muted/50',
      )}
      onClick={() => hasData && setExpanded(!expanded)}
      onKeyDown={(e) => { if (hasData && (e.key === 'Enter' || e.key === ' ')) setExpanded(!expanded); }}
    >
      <span className="shrink-0 text-xs text-muted-foreground w-20">
        {formatTime(log.time)}
      </span>
      <Badge
        variant="secondary"
        className={cn('shrink-0 text-xs px-1.5 py-0', LEVEL_COLORS[log.level])}
      >
        {log.level}
      </Badge>
      {log.source && (
        <span className="shrink-0 text-xs text-muted-foreground">
          [{log.source}]
        </span>
      )}
      <span className="flex-1 break-all">{log.msg}</span>
      {expanded && log.data && (
        <pre className="mt-1 w-full text-xs text-muted-foreground overflow-x-auto">
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ActiveLogLevels() {
  const { data: config } = useSettings();

  const levels = useMemo(() => {
    if (!config) return null;
    const s = config.settings as Partial<{
      logLevels: string[];
      logLevel: string;
    }>;
    return s.logLevels ?? (s.logLevel ? [s.logLevel] : ['info', 'warn', 'error']);
  }, [config]);

  if (!levels) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Active levels:</span>
      {levels.map((level) => (
        <Badge
          key={level}
          variant="secondary"
          className={cn('text-xs px-1.5 py-0', LEVEL_COLORS[level])}
        >
          {level}
        </Badge>
      ))}
    </div>
  );
}

interface ConnectionStatusProps {
  connected: boolean;
}

function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'h-2 w-2 rounded-full',
        connected ? 'bg-green-500' : 'bg-red-500',
      )} />
      <span className="text-xs text-muted-foreground">
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

function ExtensionLogsTab() {
  const { messages, connected, connect, disconnect, clear, setInitial } = useLogSocket();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApi<LogMessage[]>('/api/logs/entries')
      .then((entries) => { setInitial(entries); })
      .catch(() => {})
      .finally(() => { connect(); });
    return () => disconnect();
  }, [connect, disconnect, setInitial]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const filtered = useMemo(() => {
    let result = messages;
    if (levelFilter !== 'all') {
      result = result.filter((m) => m.level === levelFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.msg.toLowerCase().includes(q) ||
          (m.source?.toLowerCase().includes(q) ?? false),
      );
    }
    return result;
  }, [messages, levelFilter, search]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? 'Pause' : 'Resume'}
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
        <div className="ml-auto">
          <ConnectionStatus connected={connected} />
        </div>
      </div>

      <ScrollArea
        className="flex-1 rounded-md border bg-background"
        ref={scrollRef}
      >
        <div className="min-h-0">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              {connected
                ? 'Waiting for log events...'
                : 'Not connected to log stream'}
            </div>
          ) : (
            filtered.map((log) => (
              <LogEntry key={`${log.time}-${log.source ?? ''}-${log.msg}`} log={log} />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length} log{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== messages.length && ` (${messages.length} total)`}
        </span>
        <span>Max 1000 entries</span>
      </div>
    </>
  );
}

function ServerConsoleTab() {
  const { messages, connected, connect, disconnect, clear, setInitial } = useConsoleSocket();
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApi<ConsoleMessage[]>('/api/logs/console/entries')
      .then((entries) => { setInitial(entries); })
      .catch(() => {})
      .finally(() => { connect(); });
    return () => disconnect();
  }, [connect, disconnect, setInitial]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const filtered = useMemo(() => {
    if (!search) return messages;
    const q = search.toLowerCase();
    return messages.filter((m) => m.msg.toLowerCase().includes(q));
  }, [messages, search]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search console output..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? 'Pause' : 'Resume'}
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
        <div className="ml-auto">
          <ConnectionStatus connected={connected} />
        </div>
      </div>

      <ScrollArea
        className="flex-1 rounded-md border bg-zinc-950 dark:bg-zinc-950"
        ref={scrollRef}
      >
        <div className="min-h-0">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-zinc-500">
              {connected
                ? 'Waiting for console output...'
                : 'Not connected to console stream'}
            </div>
          ) : (
            filtered.map((entry, i) => (
              <div
                key={`${entry.time}-${i}`}
                className="flex items-start gap-2 border-b border-zinc-800 px-3 py-1.5 text-sm font-mono"
              >
                <span className="shrink-0 text-xs text-zinc-500 w-20">
                  {formatTime(entry.time)}
                </span>
                <span className={cn(
                  'shrink-0 text-xs w-12',
                  entry.level === 'error' ? 'text-red-400' :
                  entry.level === 'warn' ? 'text-yellow-400' :
                  entry.level === 'debug' ? 'text-zinc-500' :
                  'text-green-400',
                )}>
                  {entry.level}
                </span>
                <span className="flex-1 break-all text-zinc-200">
                  {entry.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
          {filtered.length !== messages.length && ` (${messages.length} total)`}
        </span>
        <span>Max 1000 entries</span>
      </div>
    </>
  );
}

export function LogsPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Logs</h1>
          <p className="text-muted-foreground">
            Real-time log stream from the dashboard server
          </p>
        </div>
        <ActiveLogLevels />
      </div>

      <Tabs defaultValue="extension" className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="extension" className="flex-1">Extension Logs</TabsTrigger>
          <TabsTrigger value="console" className="flex-1">Server Console</TabsTrigger>
        </TabsList>
        <TabsContent
          value="extension"
          className="flex-1 flex flex-col gap-2 min-h-0 data-[state=inactive]:hidden"
        >
          <ExtensionLogsTab />
        </TabsContent>
        <TabsContent
          value="console"
          className="flex-1 flex flex-col gap-2 min-h-0 data-[state=inactive]:hidden"
        >
          <ServerConsoleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
