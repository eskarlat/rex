import { useRef } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';
import { useScreencast } from '../hooks/useScreencast.js';
import { useInputForwarding } from '../hooks/useInputForwarding.js';

interface ViewportProps {
  client: CdpClient | null;
  viewport: { width: number; height: number };
}

export function Viewport({ client, viewport }: Readonly<ViewportProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useScreencast(client, canvasRef, {
    maxWidth: viewport.width,
    maxHeight: viewport.height,
  });

  useInputForwarding(client, canvasRef, viewport);

  return (
    <div className="relative flex-1 bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        tabIndex={0}
        style={{ cursor: 'default' }}
      />
      {!client?.connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Connecting...</span>
          </div>
        </div>
      )}
    </div>
  );
}
