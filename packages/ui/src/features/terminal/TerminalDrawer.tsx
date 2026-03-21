import { useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { useTerminal } from './use-terminal';
import { XtermPanel } from './XtermPanel';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { useIsMobile } from '@/hooks/use-mobile';

const MIN_WIDTH = 280;
const MAX_WIDTH = 1200;
const DEFAULT_WIDTH = 480;

function TerminalHeader({ label, onClose }: Readonly<{ label: string; onClose: () => void }>) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Terminal</span>
        <span className="max-w-[200px] truncate text-xs text-muted-foreground">{label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onClose}
        aria-label="Close terminal"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function DesktopTerminalDrawer() {
  const { isOpen, close } = useTerminal();
  const { activeProject } = useProjectContext();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - moveEvent.clientX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setWidth(newWidth);
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [width],
  );

  return (
    <div
      className={cn(
        'relative flex h-full flex-col bg-background transition-all',
        isOpen ? 'border-l' : 'w-0 overflow-hidden',
      )}
      style={isOpen ? { width: `${width}px` } : undefined}
    >
      {isOpen && (
        <>
          <div
            role="separator"
            aria-label="Resize terminal"
            className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50"
            onMouseDown={onMouseDown}
          />
          <TerminalHeader
            label={activeProject?.split('/').pop() ?? 'Home'}
            onClose={close}
          />
        </>
      )}
      <div className="flex-1 overflow-hidden p-1">
        <XtermPanel />
      </div>
    </div>
  );
}

function MobileTerminalSheet() {
  const { isOpen, close } = useTerminal();
  const { activeProject } = useProjectContext();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="bottom" className="h-[60svh] p-0" aria-describedby={undefined}>
        <SheetHeader className="sr-only">
          <SheetTitle>Terminal</SheetTitle>
        </SheetHeader>
        <TerminalHeader
          label={activeProject?.split('/').pop() ?? 'Home'}
          onClose={close}
        />
        <div className="flex-1 overflow-hidden p-1" style={{ height: 'calc(60svh - 2.5rem)' }}>
          <XtermPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TerminalDrawer() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTerminalSheet />;
  }

  return <DesktopTerminalDrawer />;
}
