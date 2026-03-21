import type { ReactNode } from 'react';
import { ArrowDown, Circle, Pause, Play, Search, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  connected: boolean;
}

function ConnectionStatus({ connected }: Readonly<ConnectionStatusProps>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Circle
              className={cn(
                'size-2 fill-current',
                connected ? 'text-emerald-500' : 'text-red-500',
              )}
            />
            <span className="text-xs text-muted-foreground">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {connected ? 'Receiving live log events' : 'WebSocket disconnected'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export interface LogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  onClear: () => void;
  onScrollToBottom: () => void;
  connected: boolean;
  placeholder: string;
  extra?: ReactNode;
}

export function LogToolbar({
  search,
  onSearchChange,
  autoScroll,
  onAutoScrollToggle,
  onClear,
  onScrollToBottom,
  connected,
  placeholder,
  extra,
}: Readonly<LogToolbarProps>) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {extra}
      <Separator orientation="vertical" className="h-6" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={autoScroll ? 'Pause' : 'Resume'}
              onClick={onAutoScrollToggle}
            >
              {autoScroll ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Scroll to bottom"
              onClick={onScrollToBottom}
            >
              <ArrowDown className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Scroll to bottom</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Clear"
              onClick={onClear}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear logs</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="ml-auto">
        <ConnectionStatus connected={connected} />
      </div>
    </div>
  );
}
