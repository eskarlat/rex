import { useEffect, useRef } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';

interface ScreencastOptions {
  format?: 'jpeg' | 'png';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useScreencast(
  client: CdpClient | null,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: ScreencastOptions = {},
) {
  const activeRef = useRef(false);

  useEffect(() => {
    if (!client?.connected || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    activeRef.current = true;

    const unsub = client.on('Page.screencastFrame', (params) => {
      if (!activeRef.current) return;

      const data = params['data'] as string;
      const sessionId = params['sessionId'] as number;

      const img = new Image();
      img.onload = () => {
        if (!activeRef.current) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        void client.send('Page.screencastFrameAck', { sessionId });
      };
      img.src = `data:image/${options.format ?? 'jpeg'};base64,${data}`;
    });

    void client.send('Page.startScreencast', {
      format: options.format ?? 'jpeg',
      quality: options.quality ?? 80,
      maxWidth: options.maxWidth ?? 1280,
      maxHeight: options.maxHeight ?? 720,
    });

    return () => {
      activeRef.current = false;
      unsub();
      void client.send('Page.stopScreencast').catch(() => {});
    };
  }, [client, client?.connected, canvasRef, options.format, options.quality, options.maxWidth, options.maxHeight]);
}
