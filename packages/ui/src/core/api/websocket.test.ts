import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogSocket } from './websocket';

class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn(() => {
    this.onclose?.();
  });
}

let mockWs: MockWebSocket;

beforeEach(() => {
  mockWs = new MockWebSocket();
  vi.stubGlobal('WebSocket', vi.fn(() => mockWs));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLogSocket', () => {
  it('creates WebSocket with correct URL on connect', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
    });

    expect(WebSocket).toHaveBeenCalledWith(
      `ws://${window.location.host}/ws/logs`
    );
  });

  it('sets connected to true on open', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
    });

    expect(result.current.connected).toBe(false);

    act(() => {
      mockWs.onopen?.();
    });

    expect(result.current.connected).toBe(true);
  });

  it('parses and adds messages', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    const logMessage = {
      level: 'info',
      message: 'test message',
      timestamp: '2024-01-01T00:00:00Z',
    };

    act(() => {
      mockWs.onmessage?.({ data: JSON.stringify(logMessage) });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(logMessage);
  });

  it('ignores malformed JSON messages', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onmessage?.({ data: 'not valid json{{{' });
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('disconnect closes the WebSocket', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockWs.close).toHaveBeenCalled();
    expect(result.current.connected).toBe(false);
  });

  it('connect is a no-op if already connected', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      result.current.connect();
    });

    expect(WebSocket).toHaveBeenCalledTimes(1);
  });

  it('cleans up WebSocket on unmount', () => {
    const { result, unmount } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    unmount();

    expect(mockWs.close).toHaveBeenCalled();
  });
});
