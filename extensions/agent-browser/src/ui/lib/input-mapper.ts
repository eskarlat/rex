/** Maps DOM events to CDP Input protocol parameters */

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CdpMouseParams {
  type: string;
  x: number;
  y: number;
  button: string;
  clickCount: number;
  modifiers: number;
}

export interface CdpKeyParams {
  type: string;
  key: string;
  code: string;
  windowsVirtualKeyCode: number;
  modifiers: number;
}

export interface CdpWheelParams {
  type: 'mouseWheel';
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  modifiers: number;
}

/** Scale canvas-relative coordinates to viewport coordinates */
export function scaleToViewport(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  viewport: ViewportSize,
): { x: number; y: number } {
  const scaleX = viewport.width / canvasRect.width;
  const scaleY = viewport.height / canvasRect.height;
  return {
    x: Math.round((clientX - canvasRect.left) * scaleX),
    y: Math.round((clientY - canvasRect.top) * scaleY),
  };
}

/** Extract CDP modifier flags from a DOM event */
export function getModifiers(event: {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}): number {
  let modifiers = 0;
  if (event.altKey) modifiers |= 1;
  if (event.ctrlKey) modifiers |= 2;
  if (event.metaKey) modifiers |= 4;
  if (event.shiftKey) modifiers |= 8;
  return modifiers;
}

const BUTTON_MAP: Record<number, string> = {
  0: 'left',
  1: 'middle',
  2: 'right',
};

/** Map a DOM MouseEvent to CDP Input.dispatchMouseEvent params */
export function mapMouseEvent(
  eventType: 'mousedown' | 'mouseup' | 'mousemove',
  clientX: number,
  clientY: number,
  button: number,
  canvasRect: DOMRect,
  viewport: ViewportSize,
  modifiers: number,
  clickCount = 1,
): CdpMouseParams {
  const { x, y } = scaleToViewport(clientX, clientY, canvasRect, viewport);
  const cdpTypeMap: Record<string, string> = {
    mousedown: 'mousePressed',
    mouseup: 'mouseReleased',
    mousemove: 'mouseMoved',
  };

  return {
    type: cdpTypeMap[eventType] ?? 'mouseMoved',
    x,
    y,
    button: BUTTON_MAP[button] ?? 'left',
    clickCount: eventType === 'mousemove' ? 0 : clickCount,
    modifiers,
  };
}

/** Map a DOM KeyboardEvent to CDP Input.dispatchKeyEvent params */
export function mapKeyEvent(
  eventType: 'keydown' | 'keyup',
  key: string,
  code: string,
  keyCode: number,
  modifiers: number,
): CdpKeyParams {
  return {
    type: eventType === 'keydown' ? 'keyDown' : 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    modifiers,
  };
}

/** Map a DOM WheelEvent to CDP Input.dispatchMouseEvent (mouseWheel) params */
export function mapWheelEvent(
  clientX: number,
  clientY: number,
  deltaX: number,
  deltaY: number,
  canvasRect: DOMRect,
  viewport: ViewportSize,
  modifiers: number,
): CdpWheelParams {
  const { x, y } = scaleToViewport(clientX, clientY, canvasRect, viewport);
  return {
    type: 'mouseWheel',
    x,
    y,
    deltaX,
    deltaY,
    modifiers,
  };
}
