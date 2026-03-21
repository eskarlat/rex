import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogSocket, useConsoleSocket } from './websocket';

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
  vi.stubGlobal(
    'WebSocket',
    vi.fn(() => mockWs),
  );
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

    expect(WebSocket).toHaveBeenCalledWith(`ws://${window.location.host}/api/logs`);
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

  it('clear empties the messages array', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.setInitial([{ level: 'info', msg: 'test', time: '2026-01-01T00:00:00Z' }]);
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clear();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('setInitial truncates to 1000 messages', () => {
    const { result } = renderHook(() => useLogSocket());
    const entries = Array.from({ length: 1005 }, (_, i) => ({
      level: 'info',
      msg: `msg-${i}`,
      time: '2026-01-01T00:00:00Z',
    }));

    act(() => {
      result.current.setInitial(entries);
    });

    expect(result.current.messages).toHaveLength(1000);
  });

  it('handles WebSocket error by closing', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onerror?.();
    });

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('sets connected to false on close', () => {
    const { result } = renderHook(() => useLogSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    expect(result.current.connected).toBe(true);

    act(() => {
      mockWs.onclose?.();
    });

    expect(result.current.connected).toBe(false);
  });
});

describe('useConsoleSocket', () => {
  it('starts disconnected with empty messages', () => {
    const { result } = renderHook(() => useConsoleSocket());
    expect(result.current.connected).toBe(false);
    expect(result.current.messages).toEqual([]);
  });

  it('connects and receives messages', () => {
    const { result } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    expect(result.current.connected).toBe(true);

    act(() => {
      mockWs.onmessage?.({
        data: JSON.stringify({ level: 'info', msg: 'hello', time: '2026-01-01T00:00:00Z' }),
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toHaveProperty('msg', 'hello');
  });

  it('disconnect closes the WebSocket', () => {
    const { result } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('clear and setInitial work correctly', () => {
    const { result } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.setInitial([
        { level: 'info', msg: 'a', time: '2026-01-01T00:00:00Z' },
        { level: 'warn', msg: 'b', time: '2026-01-01T00:01:00Z' },
      ]);
    });

    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('handles error by closing', () => {
    const { result } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onerror?.();
    });

    expect(mockWs.close).toHaveBeenCalled();
  });

  it('ignores malformed messages', () => {
    const { result } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    act(() => {
      mockWs.onmessage?.({ data: 'not json' });
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useConsoleSocket());

    act(() => {
      result.current.connect();
      mockWs.onopen?.();
    });

    unmount();
    expect(mockWs.close).toHaveBeenCalled();
  });
});
