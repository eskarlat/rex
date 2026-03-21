import { useState, type KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';

import { formatTime, LEVEL_ICON, LEVEL_VARIANT } from '../constants';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import type { LogMessage } from '@/core/api/websocket';
import { cn } from '@/lib/utils';

interface LogDataRowProps {
  data: Record<string, unknown>;
}

function LogDataRow({ data }: Readonly<LogDataRowProps>) {
  return (
    <TableRow className="border-b">
      <TableCell colSpan={4} className="bg-muted/30 py-2 px-3">
        <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </TableCell>
    </TableRow>
  );
}

interface LevelBadgeProps {
  level: string;
}

function LevelBadge({ level }: Readonly<LevelBadgeProps>) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 px-1.5 py-0 text-[11px] font-medium', LEVEL_VARIANT[level])}
    >
      {LEVEL_ICON[level]}
      {level}
    </Badge>
  );
}

interface MessageCellProps {
  msg: string;
  expandable: boolean;
  expanded: boolean;
}

function MessageCell({ msg, expandable, expanded }: Readonly<MessageCellProps>) {
  return (
    <TableCell className="py-1.5 pr-3">
      <div className="flex items-center gap-1.5">
        {expandable && (
          <ChevronRight
            className={cn(
              'size-3 shrink-0 text-muted-foreground transition-transform',
              expanded && 'rotate-90',
            )}
          />
        )}
        <span className="break-all">{msg}</span>
      </div>
    </TableCell>
  );
}

function useInteractiveRow(hasData: boolean, toggle: () => void) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') toggle();
  };
  if (!hasData) return {};
  return { onClick: toggle, role: 'button' as const, tabIndex: 0, onKeyDown };
}

interface LogEntryProps {
  log: LogMessage;
}

export function LogEntry({ log }: Readonly<LogEntryProps>) {
  const [expanded, setExpanded] = useState(false);
  const hasData = log.data !== undefined && Object.keys(log.data).length > 0;
  const toggle = () => setExpanded((v) => !v);
  const interactiveProps = useInteractiveRow(hasData, toggle);

  return (
    <>
      <TableRow
        className={cn(
          'group font-mono text-xs',
          hasData && 'cursor-pointer',
          expanded && 'border-b-0',
        )}
        {...interactiveProps}
      >
        <TableCell className="w-[100px] whitespace-nowrap text-muted-foreground py-1.5 pl-3">
          {formatTime(log.time)}
        </TableCell>
        <TableCell className="w-[80px] py-1.5">
          <LevelBadge level={log.level} />
        </TableCell>
        <TableCell className="w-[120px] py-1.5 text-muted-foreground truncate">
          {log.source && <span className="font-medium text-foreground/70">{log.source}</span>}
        </TableCell>
        <MessageCell msg={log.msg} expandable={hasData} expanded={expanded} />
      </TableRow>
      {expanded && log.data && <LogDataRow data={log.data} />}
    </>
  );
}
