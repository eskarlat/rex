import type { SelectedElement } from '../hooks/useDevMode.js';

interface ElementsPanelProps {
  element: SelectedElement | null;
}

export function ElementsPanel({ element }: Readonly<ElementsPanelProps>) {
  if (!element) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-muted-foreground">
          Enable Dev Mode and click an element in the viewport to inspect it
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div>
        <h4 className="text-xs font-medium mb-1">Selector</h4>
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
          {element.selector}
        </code>
      </div>
      <div>
        <h4 className="text-xs font-medium mb-1">Dimensions</h4>
        <p className="text-xs text-muted-foreground font-mono">
          {element.width} x {element.height}
        </p>
      </div>
      <div>
        <h4 className="text-xs font-medium mb-1">Computed Styles</h4>
        <div className="space-y-0.5">
          {Object.entries(element.styles).map(([prop, value]) => (
            <div key={prop} className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">{prop}:</span>
              <span>{value}</span>
            </div>
          ))}
          {Object.keys(element.styles).length === 0 && (
            <p className="text-xs text-muted-foreground">No computed styles</p>
          )}
        </div>
      </div>
    </div>
  );
}
