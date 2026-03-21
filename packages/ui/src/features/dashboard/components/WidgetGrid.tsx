import { useState, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import { WidgetCard } from './WidgetCard';
import { WidgetPicker } from './WidgetPicker';

import { Button } from '@/components/ui/button';
import { useDashboardLayout, useSaveDashboardLayout } from '@/core/hooks/use-dashboard-layout';
import type { DashboardLayout, WidgetPlacement } from '@/core/hooks/use-dashboard-layout';
import { useMarketplace } from '@/core/hooks/use-extensions';

interface WidgetConstraintsMap {
  [compositeId: string]: {
    minSize?: { w: number; h: number };
    maxSize?: { w: number; h: number };
  };
}

export function WidgetGrid() {
  const { data: layout } = useDashboardLayout();
  const { data: marketplace } = useMarketplace();
  const saveMutation = useSaveDashboardLayout();
  const [pickerOpen, setPickerOpen] = useState(false);

  const allWidgets = layout?.widgets ?? [];

  const { constraintsMap, titleMap, activeExtensionNames } = useMemo(() => {
    const constraints: WidgetConstraintsMap = {};
    const titles: Record<string, string> = {};
    const names = new Set<string>();
    for (const ext of marketplace?.active ?? []) {
      names.add(ext.name);
      for (const w of ext.widgets ?? []) {
        const key = `${ext.name}:${w.id}`;
        constraints[key] = { minSize: w.minSize, maxSize: w.maxSize };
        titles[key] = w.title;
      }
    }
    return { constraintsMap: constraints, titleMap: titles, activeExtensionNames: names };
  }, [marketplace]);

  const widgets = useMemo(
    () => allWidgets.filter((w) => activeExtensionNames.has(w.extensionName)),
    [allWidgets, activeExtensionNames],
  );
  const addedWidgetIds = new Set(widgets.map((w) => w.id));

  const saveLayout = useCallback(
    (updated: DashboardLayout) => {
      saveMutation.mutate(updated);
    },
    [saveMutation],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(widgets, oldIndex, newIndex);
      saveLayout({ widgets: reordered });
    },
    [widgets, saveLayout],
  );

  const handleRemove = useCallback(
    (widgetId: string) => {
      const filtered = widgets.filter((w) => w.id !== widgetId);
      saveLayout({ widgets: filtered });
    },
    [widgets, saveLayout],
  );

  const handleResize = useCallback(
    (widgetId: string, newSize: { w: number; h: number }) => {
      const updated = widgets.map((w) => (w.id === widgetId ? { ...w, size: newSize } : w));
      saveLayout({ widgets: updated });
    },
    [widgets, saveLayout],
  );

  const handleAddWidget = useCallback(
    (extensionName: string, widgetId: string, defaultSize: { w: number; h: number }) => {
      const placement: WidgetPlacement = {
        id: `${extensionName}:${widgetId}`,
        extensionName,
        widgetId,
        position: { x: 0, y: 0 },
        size: defaultSize,
      };
      saveLayout({ widgets: [...widgets, placement] });
      setPickerOpen(false);
    },
    [widgets, saveLayout],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Widgets</h2>
        <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Widget
        </Button>
      </div>

      {widgets.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="empty-state">
          No widgets yet. Click Add Widget to get started.
        </p>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
              {widgets.map((w) => (
                <WidgetCard
                  key={w.id}
                  id={w.id}
                  extensionName={w.extensionName}
                  widgetId={w.widgetId}
                  title={titleMap[w.id] ?? w.widgetId}
                  size={w.size}
                  constraints={constraintsMap[w.id]}
                  onRemove={() => handleRemove(w.id)}
                  onResize={(newSize) => handleResize(w.id, newSize)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <WidgetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAdd={handleAddWidget}
        addedWidgetIds={addedWidgetIds}
      />
    </div>
  );
}
