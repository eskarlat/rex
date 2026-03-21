import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useEvents } from './useEvents';
import type { RenreKitSDK, SDKEventHandler, SDKEventPayload } from '../../core/types';

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), publish: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    notify: vi.fn(),
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

  it('starts with null lastEvent and empty events', () => {
    const { result } = renderHook(() => useEvents('ext:activate'), { wrapper });
    expect(result.current.lastEvent).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it('subscribes on mount and unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useEvents('ext:activate'), { wrapper });

    expect(mockSDK.events.on).toHaveBeenCalledWith('ext:activate', expect.any(Function));

    unmount();

    expect(mockSDK.events.off).toHaveBeenCalledWith('ext:activate', expect.any(Function));
  });

  it('collects events and tracks lastEvent', () => {
    const { result } = renderHook(() => useEvents('ext:activate'), { wrapper });

    // Get the handler that was registered
    const handler = vi.mocked(mockSDK.events.on).mock.calls[0]?.[1] as SDKEventHandler;

    const event1: SDKEventPayload = { type: 'ext:activate', name: 'foo' };
    const event2: SDKEventPayload = { type: 'ext:activate', name: 'bar' };

    act(() => {
      handler(event1);
    });

    expect(result.current.lastEvent).toEqual(event1);
    expect(result.current.events).toHaveLength(1);

    act(() => {
      handler(event2);
    });

    expect(result.current.lastEvent).toEqual(event2);
    expect(result.current.events).toHaveLength(2);
  });

  it('resubscribes when event type changes', () => {
    const { rerender } = renderHook(({ event }) => useEvents(event), {
      wrapper,
      initialProps: { event: 'ext:activate' as const },
    });

    rerender({ event: 'ext:deactivate' as const });

    expect(mockSDK.events.off).toHaveBeenCalledWith('ext:activate', expect.any(Function));
    expect(mockSDK.events.on).toHaveBeenCalledWith('ext:deactivate', expect.any(Function));
  });
});
