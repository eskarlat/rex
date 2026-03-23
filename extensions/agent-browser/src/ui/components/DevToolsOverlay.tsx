import { Card, CardContent, Button } from '@renre-kit/extension-sdk/components';

import type { SelectedElement } from '../hooks/useDevMode.js';

interface DevToolsOverlayProps {
  element: SelectedElement | null;
  onClose: () => void;
}

export function DevToolsOverlay({ element, onClose }: Readonly<DevToolsOverlayProps>) {
  if (!element) return null;

  const handleCopySelector = () => {
    void navigator.clipboard.writeText(element.selector);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Card className="w-64 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <code className="text-xs font-mono font-medium break-all">{element.selector}</code>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0" aria-label="Close inspector">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {element.width} x {element.height}
          </p>
          <div className="space-y-0.5">
            {Object.entries(element.styles).map(([prop, value]) => (
              <div key={prop} className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">{prop}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopySelector} className="w-full mt-2 h-6 text-xs">
            Copy selector
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
