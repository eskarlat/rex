import { useEffect } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';
import {
  getModifiers,
  mapMouseEvent,
  mapKeyEvent,
  mapWheelEvent,
  type ViewportSize,
} from '../lib/input-mapper.js';

export function useInputForwarding(
  client: CdpClient | null,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  viewport: ViewportSize,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!client?.connected || !canvas) return;

    const handleMouse = (e: MouseEvent) => {
      const eventType = e.type as 'mousedown' | 'mouseup' | 'mousemove';
      const rect = canvas.getBoundingClientRect();
      const mods = getModifiers(e);
      const params = mapMouseEvent(eventType, e.clientX, e.clientY, e.button, rect, viewport, mods);
      void client.send('Input.dispatchMouseEvent', params as unknown as Record<string, unknown>);
    };

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      const eventType = e.type as 'keydown' | 'keyup';
      const mods = getModifiers(e);
      // CDP requires windowsVirtualKeyCode which maps to the deprecated keyCode
      const keyCode = (e as unknown as Record<string, unknown>)['keyCode'] as number;
      const params = mapKeyEvent(eventType, e.key, e.code, keyCode, mods);
      void client.send('Input.dispatchKeyEvent', params as unknown as Record<string, unknown>);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mods = getModifiers(e);
      const params = mapWheelEvent(e.clientX, e.clientY, e.deltaX, e.deltaY, rect, viewport, mods);
      void client.send('Input.dispatchMouseEvent', params as unknown as Record<string, unknown>);
    };

    canvas.addEventListener('mousedown', handleMouse);
    canvas.addEventListener('mouseup', handleMouse);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('keydown', handleKey);
    canvas.addEventListener('keyup', handleKey);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouse);
      canvas.removeEventListener('mouseup', handleMouse);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('keyup', handleKey);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [client, client?.connected, canvasRef, viewport]);
}
