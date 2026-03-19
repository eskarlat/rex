import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicWidget } from './DynamicWidget';

interface WidgetCardProps {
  id: string;
  extensionName: string;
  widgetId: string;
  title: string;
  size: { w: number; h: number };
  onRemove: () => void;
}

export function WidgetCard({
  id,
  extensionName,
  widgetId,
  title,
  size,
  onRemove,
}: WidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    gridColumn: `span ${size.w}`,
    gridRow: `span ${size.h}`,
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative overflow-hidden" {...attributes}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            data-testid="drag-handle"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
          data-testid="remove-widget"
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <DynamicWidget extensionName={extensionName} widgetId={widgetId} />
      </CardContent>
    </Card>
  );
}
