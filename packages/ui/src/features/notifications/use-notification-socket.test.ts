import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';
import { useNotificationSocket } from './use-notification-socket';

class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1;
  sent: string[] = [];
  close = vi.fn(() => {
    this.onclose?.();
  });
  send = vi.fn((data: string) => {
    this.sent.push(data);
  });
}

let mockWs: MockWebSocket;

beforeEach(() => {
  mockWs = new MockWebSocket();
  vi.stubGlobal(
    'WebSocket',
    vi.fn(() => mockWs),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    },
  };
}

describe('useNotificationSocket', () => {
  it('connects to /api/events WebSocket on mount', () => {
    const { wrapper } = createWrapper();
    renderHook(() => useNotificationSocket(), { wrapper });

    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
    );
  });

  it('sends subscribe message for system:notification:* on open', () => {
    const { wrapper } = createWrapper();
    renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
    });

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ action: 'subscribe', patterns: ['system:notification:*'] }),
    );
  });

  it('invalidates notification queries when event arrives', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onmessage?.({
        data: JSON.stringify({
          action: 'event',
          event: {
            type: 'system:notification:created',
            source: 'ext:test',
            data: { id: 1, title: 'Hello' },
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('ignores non-event messages', () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onmessage?.({ data: JSON.stringify({ action: 'other' }) });
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('ignores malformed JSON', () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
      mockWs.onmessage?.({ data: 'not json' });
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('closes WebSocket on unmount', () => {
    const { wrapper } = createWrapper();
    const { unmount } = renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
    });

    unmount();

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('reconnects after close with backoff', () => {
    vi.useFakeTimers();
    const { wrapper } = createWrapper();
    renderHook(() => useNotificationSocket(), { wrapper });

    act(() => {
      mockWs.onopen?.();
    });

    // Simulate unexpected close
    act(() => {
      mockWs.onclose?.();
    });

    // Should reconnect after delay
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(WebSocket).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
