import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';

import { DynamicWidget } from './DynamicWidget';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SizeConstraints {
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

interface WidgetCardProps {
  id: string;
  extensionName: string;
  widgetId: string;
  title: string;
  size: { w: number; h: number };
  constraints?: SizeConstraints;
  onRemove: () => void;
  onResize?: (newSize: { w: number; h: number }) => void;
}

function clampSize(
  size: { w: number; h: number },
  constraints?: SizeConstraints,
): { w: number; h: number } {
  let { w, h } = size;
  if (constraints?.minSize) {
    w = Math.max(w, constraints.minSize.w);
    h = Math.max(h, constraints.minSize.h);
  }
  if (constraints?.maxSize) {
    w = Math.min(w, constraints.maxSize.w);
    h = Math.min(h, constraints.maxSize.h);
  }
  return { w, h };
}

function buildWidgetStyle(
  isMobile: boolean,
  transformStr: string | undefined,
  transition: string | undefined,
  size: { w: number; h: number },
): React.CSSProperties {
  const base = { transform: transformStr, transition };
  if (isMobile) return { ...base, minHeight: `${size.h * 100}px` };
  return { ...base, gridColumn: `span ${size.w}`, gridRow: `span ${size.h}` };
}

function ResizeControls({
  canShrink,
  canGrow,
  onShrink,
  onGrow,
}: Readonly<{ canShrink: boolean; canGrow: boolean; onShrink: () => void; onGrow: () => void }>) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onShrink}
        disabled={!canShrink}
        data-testid="shrink-widget"
        aria-label="Shrink widget"
      >
        <Minimize2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onGrow}
        disabled={!canGrow}
        data-testid="grow-widget"
        aria-label="Grow widget"
      >
        <Maximize2 className="h-3 w-3" />
      </Button>
    </>
  );
}

export function WidgetCard({
  id,
  extensionName,
  widgetId,
  title,
  size,
  constraints,
  onRemove,
  onResize,
}: Readonly<WidgetCardProps>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const isMobile = useIsMobile();
  const style = buildWidgetStyle(isMobile, CSS.Transform.toString(transform), transition, size);

  const canGrow =
    !constraints?.maxSize || size.w < constraints.maxSize.w || size.h < constraints.maxSize.h;

  const canShrink =
    !constraints?.minSize || size.w > constraints.minSize.w || size.h > constraints.minSize.h;

  const handleGrow = () => {
    if (!onResize) return;
    onResize(clampSize({ w: size.w + 1, h: size.h + 1 }, constraints));
  };

  const handleShrink = () => {
    if (!onResize) return;
    onResize(clampSize({ w: size.w - 1, h: size.h - 1 }, constraints));
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative flex flex-col overflow-hidden" {...attributes}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="drag-handle"
            aria-label="Drag to reorder widget"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-0.5">
          {onResize && !isMobile && (
            <ResizeControls
              canShrink={canShrink}
              canGrow={canGrow}
              onShrink={handleShrink}
              onGrow={handleGrow}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
            data-testid="remove-widget"
            aria-label="Remove widget"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto px-3 pb-3 pt-0">
        <DynamicWidget extensionName={extensionName} widgetId={widgetId} />
      </CardContent>
    </Card>
  );
}
