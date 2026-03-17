import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useEvents } from './useEvents';
import type { RenreKitSDK, SDKEventHandler } from '../../core/types';

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    destroy: vi.fn(),
  };
}

describe('useEvents', () => {
  let mockSDK: RenreKitSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
  });

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return createElement(SDKProvider, { sdk: mockSDK }, children);
  }

  it('subscribes to event on mount', () => {
    const handler: SDKEventHandler = vi.fn();

    renderHook(() => useEvents('ext:activate', handler), { wrapper });

    expect(mockSDK.events.on).toHaveBeenCalledWith('ext:activate', handler);
  });

  it('unsubscribes from event on unmount', () => {
    const handler: SDKEventHandler = vi.fn();

    const { unmount } = renderHook(() => useEvents('ext:activate', handler), { wrapper });

    unmount();

    expect(mockSDK.events.off).toHaveBeenCalledWith('ext:activate', handler);
  });

  it('resubscribes when event type changes', () => {
    const handler: SDKEventHandler = vi.fn();

    const { rerender } = renderHook(
      ({ event }) => useEvents(event, handler),
      {
        wrapper,
        initialProps: { event: 'ext:activate' as const },
      },
    );

    rerender({ event: 'ext:deactivate' as const });

    // Should have unsubscribed from old event
    expect(mockSDK.events.off).toHaveBeenCalledWith('ext:activate', handler);
    // Should have subscribed to new event
    expect(mockSDK.events.on).toHaveBeenCalledWith('ext:deactivate', handler);
  });
});
