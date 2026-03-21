import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/core/hooks/use-extensions';

interface WidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (extensionName: string, widgetId: string, defaultSize: { w: number; h: number }) => void;
  addedWidgetIds: Set<string>;
}

export function WidgetPicker({ open, onOpenChange, onAdd, addedWidgetIds }: WidgetPickerProps) {
  const { data: marketplace } = useMarketplace();

  const availableWidgets = (marketplace?.active ?? []).flatMap((ext) =>
    (ext.widgets ?? []).map((w) => ({
      extensionName: ext.name,
      extensionTitle: ext.title ?? ext.name,
      ...w,
    })),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-2" data-testid="widget-picker-list">
          {availableWidgets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No widgets available. Install and activate extensions with widgets.
            </p>
          )}
          {availableWidgets.map((w) => {
            const compositeId = `${w.extensionName}:${w.id}`;
            const isAdded = addedWidgetIds.has(compositeId);
            return (
              <div
                key={compositeId}
                className="flex items-center justify-between rounded border p-2"
              >
                <div>
                  <p className="text-sm font-medium">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.extensionTitle}</p>
                </div>
                <Button
                  size="sm"
                  variant={isAdded ? 'outline' : 'default'}
                  disabled={isAdded}
                  onClick={() => onAdd(w.extensionName, w.id, w.defaultSize)}
                >
                  {isAdded ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
