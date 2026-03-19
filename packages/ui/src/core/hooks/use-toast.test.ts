import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, showToast, setGlobalToastHandler } from './use-toast';

beforeEach(() => {
  setGlobalToastHandler(null);
  vi.restoreAllMocks();
});

describe('useToast', () => {
  it('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast via showToast after hook is mounted', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      showToast({ title: 'Hello' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]?.title).toBe('Hello');
  });

  it('adds toast with description and variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      showToast({ title: 'Error', description: 'Something failed', variant: 'destructive' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]?.description).toBe('Something failed');
    expect(result.current.toasts[0]?.variant).toBe('destructive');
  });

  it('dismiss removes a toast by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      showToast({ title: 'First' });
      showToast({ title: 'Second' });
    });

    expect(result.current.toasts).toHaveLength(2);
    const firstId = result.current.toasts[0]?.id ?? '';

    act(() => {
      result.current.dismiss(firstId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]?.title).toBe('Second');
  });

  it('auto-removes toast after delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      showToast({ title: 'Auto remove' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(4100);
    });

    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('cleans up global handler on unmount', () => {
    const { unmount } = renderHook(() => useToast());
    unmount();

    // After unmount, showToast should be a no-op (no handler)
    // Should not throw
    showToast({ title: 'Orphan' });
  });
});

describe('showToast', () => {
  it('does nothing when no handler is set', () => {
    // Should not throw
    showToast({ title: 'No handler' });
  });
});
