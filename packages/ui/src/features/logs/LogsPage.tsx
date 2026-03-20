import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
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
import { useLogSocket, useConsoleSocket, type LogMessage } from '@/core/api/websocket';
import { useSettings } from '@/core/hooks/use-settings';
import { fetchApi } from '@/core/api/client';
import { cn } from '@/lib/utils';

const LEVEL_COLORS: Record<string, string> = {
  debug: 'bg-muted text-muted-foreground',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const consoleLevelColors: Record<string, string> = {
  error: 'text-red-600 dark:text-red-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  debug: 'text-zinc-400 dark:text-zinc-500',
};

function consoleColorForLevel(level: string): string {
  return consoleLevelColors[level] ?? 'text-green-600 dark:text-green-400';
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

interface StreamControls<T> {
  messages: T[];
  connected: boolean;
  clear: () => void;
  connect: () => void;
  disconnect: () => void;
  setInitial: (entries: T[]) => void;
}

function useStreamLifecycle<T>(
  stream: StreamControls<T>,
  initialUrl: string,
  scrollRef: React.RefObject<HTMLDivElement | null>,
  autoScroll: boolean,
): void {
  const { connect, disconnect, setInitial, messages } = stream;

  useEffect(() => {
    fetchApi<T[]>(initialUrl)
      .then((entries) => { setInitial(entries); })
      .catch(() => {})
      .finally(() => { connect(); });
    return () => disconnect();
  }, [connect, disconnect, setInitial, initialUrl]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll, scrollRef]);
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

interface LogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  onClear: () => void;
  connected: boolean;
  placeholder: string;
  extra?: ReactNode;
}

function LogToolbar({
  search, onSearchChange, autoScroll, onAutoScrollToggle,
  onClear, connected, placeholder, extra,
}: LogToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      {extra}
      <Button variant="outline" size="sm" onClick={onAutoScrollToggle}>
        {autoScroll ? 'Pause' : 'Resume'}
      </Button>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear
      </Button>
      <div className="ml-auto">
        <ConnectionStatus connected={connected} />
      </div>
    </div>
  );
}

interface LogFooterProps {
  filteredCount: number;
  totalCount: number;
  unit: string;
  unitPlural: string;
}

function LogFooter({ filteredCount, totalCount, unit, unitPlural }: LogFooterProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        {filteredCount} {filteredCount !== 1 ? unitPlural : unit}
        {filteredCount !== totalCount && ` (${totalCount} total)`}
      </span>
      <span>Max 1000 entries</span>
    </div>
  );
}

function ExtensionLogsTab() {
  const stream = useLogSocket();
  const { messages, connected, clear } = stream;
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useStreamLifecycle(stream, '/api/logs/entries', scrollRef, autoScroll);

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
        connected={connected}
        placeholder="Search logs..."
        extra={levelSelect}
      />

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

      <LogFooter
        filteredCount={filtered.length}
        totalCount={messages.length}
        unit="log"
        unitPlural="logs"
      />
    </>
  );
}

function ServerConsoleTab() {
  const stream = useConsoleSocket();
  const { messages, connected, clear } = stream;
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useStreamLifecycle(stream, '/api/logs/console/entries', scrollRef, autoScroll);

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
        connected={connected}
        placeholder="Search console output..."
      />

      <ScrollArea
        className="flex-1 rounded-md border bg-zinc-100 dark:bg-zinc-950"
        ref={scrollRef}
      >
        <div className="min-h-0">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              {connected
                ? 'Waiting for console output...'
                : 'Not connected to console stream'}
            </div>
          ) : (
            filtered.map((entry, i) => (
              <div
                key={`${entry.time}-${i}`}
                className="flex items-start gap-2 border-b border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm font-mono"
              >
                <span className="shrink-0 text-xs text-muted-foreground w-20">
                  {formatTime(entry.time)}
                </span>
                <span className={cn(
                  'shrink-0 text-xs w-12',
                  consoleColorForLevel(entry.level),
                )}>
                  {entry.level}
                </span>
                <span className="flex-1 break-all text-zinc-800 dark:text-zinc-200">
                  {entry.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <LogFooter
        filteredCount={filtered.length}
        totalCount={messages.length}
        unit="entry"
        unitPlural="entries"
      />
    </>
  );
}

export function LogsPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
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
