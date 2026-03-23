import { describe, it, expect } from 'vitest';

import {
  scaleToViewport,
  getModifiers,
  mapMouseEvent,
  mapKeyEvent,
  mapWheelEvent,
} from './input-mapper.js';

const viewport = { width: 1280, height: 720 };
const canvasRect = { left: 0, top: 0, width: 640, height: 360 } as DOMRect;

describe('scaleToViewport', () => {
  it('scales coordinates from canvas to viewport', () => {
    const result = scaleToViewport(320, 180, canvasRect, viewport);
    expect(result).toEqual({ x: 640, y: 360 });
  });

  it('handles origin correctly', () => {
    expect(scaleToViewport(0, 0, canvasRect, viewport)).toEqual({ x: 0, y: 0 });
  });

  it('handles canvas offset', () => {
    const offsetRect = { left: 100, top: 50, width: 640, height: 360 } as DOMRect;
    const result = scaleToViewport(420, 230, offsetRect, viewport);
    expect(result).toEqual({ x: 640, y: 360 });
  });

  it('rounds to integers', () => {
    const result = scaleToViewport(1, 1, canvasRect, viewport);
    expect(result.x).toBe(Math.round(1 * 2));
    expect(result.y).toBe(Math.round(1 * 2));
  });
});

describe('getModifiers', () => {
  it('returns 0 for no modifiers', () => {
    expect(getModifiers({ altKey: false, ctrlKey: false, metaKey: false, shiftKey: false })).toBe(0);
  });

  it('sets alt flag (1)', () => {
    expect(getModifiers({ altKey: true, ctrlKey: false, metaKey: false, shiftKey: false })).toBe(1);
  });

  it('sets ctrl flag (2)', () => {
    expect(getModifiers({ altKey: false, ctrlKey: true, metaKey: false, shiftKey: false })).toBe(2);
  });

  it('sets meta flag (4)', () => {
    expect(getModifiers({ altKey: false, ctrlKey: false, metaKey: true, shiftKey: false })).toBe(4);
  });

  it('sets shift flag (8)', () => {
    expect(getModifiers({ altKey: false, ctrlKey: false, metaKey: false, shiftKey: true })).toBe(8);
  });

  it('combines multiple modifiers', () => {
    expect(getModifiers({ altKey: true, ctrlKey: true, metaKey: false, shiftKey: true })).toBe(1 | 2 | 8);
  });
});

describe('mapMouseEvent', () => {
  it('maps mousedown to mousePressed', () => {
    const result = mapMouseEvent('mousedown', 320, 180, 0, canvasRect, viewport, 0);
    expect(result.type).toBe('mousePressed');
    expect(result.x).toBe(640);
    expect(result.y).toBe(360);
    expect(result.button).toBe('left');
    expect(result.clickCount).toBe(1);
  });

  it('maps mouseup to mouseReleased', () => {
    const result = mapMouseEvent('mouseup', 0, 0, 0, canvasRect, viewport, 0);
    expect(result.type).toBe('mouseReleased');
  });

  it('maps mousemove to mouseMoved with clickCount 0', () => {
    const result = mapMouseEvent('mousemove', 100, 50, 0, canvasRect, viewport, 0);
    expect(result.type).toBe('mouseMoved');
    expect(result.clickCount).toBe(0);
  });

  it('maps right button', () => {
    const result = mapMouseEvent('mousedown', 0, 0, 2, canvasRect, viewport, 0);
    expect(result.button).toBe('right');
  });

  it('passes modifiers through', () => {
    const result = mapMouseEvent('mousedown', 0, 0, 0, canvasRect, viewport, 10);
    expect(result.modifiers).toBe(10);
  });
});

describe('mapKeyEvent', () => {
  it('maps keydown', () => {
    const result = mapKeyEvent('keydown', 'a', 'KeyA', 65, 0);
    expect(result).toEqual({
      type: 'keyDown',
      key: 'a',
      code: 'KeyA',
      windowsVirtualKeyCode: 65,
      modifiers: 0,
    });
  });

  it('maps keyup', () => {
    const result = mapKeyEvent('keyup', 'Enter', 'Enter', 13, 0);
    expect(result.type).toBe('keyUp');
  });

  it('includes modifiers', () => {
    const result = mapKeyEvent('keydown', 'c', 'KeyC', 67, 2);
    expect(result.modifiers).toBe(2);
  });
});

describe('mapWheelEvent', () => {
  it('maps wheel event with scaled coordinates', () => {
    const result = mapWheelEvent(320, 180, 0, -100, canvasRect, viewport, 0);
    expect(result).toEqual({
      type: 'mouseWheel',
      x: 640,
      y: 360,
      deltaX: 0,
      deltaY: -100,
      modifiers: 0,
    });
  });
});
