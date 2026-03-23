import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoScroll, useScrollToBottom } from './hooks';

describe('useAutoScroll', () => {
  it('scrolls to bottom when enabled and element exists', () => {
    const el = { scrollTop: 0, scrollHeight: 500 };
    const ref = { current: el as unknown as HTMLElement };

    renderHook(() => useAutoScroll(ref, 5, true));

    expect(el.scrollTop).toBe(500);
  });

  it('does not scroll when disabled', () => {
    const el = { scrollTop: 0, scrollHeight: 500 };
    const ref = { current: el as unknown as HTMLElement };

    renderHook(() => useAutoScroll(ref, 5, false));

    expect(el.scrollTop).toBe(0);
  });

  it('does not scroll when ref is null', () => {
    const ref = { current: null };

    // Should not throw
    renderHook(() => useAutoScroll(ref, 5, true));
  });
});

describe('useScrollToBottom', () => {
  it('scrolls to bottom when called', () => {
    const el = { scrollTop: 0, scrollHeight: 500 };
    const ref = { current: el as unknown as HTMLElement };

    const { result } = renderHook(() => useScrollToBottom(ref));

    act(() => {
      result.current();
    });

    expect(el.scrollTop).toBe(500);
  });

  it('does nothing when ref is null', () => {
    const ref = { current: null };

    const { result } = renderHook(() => useScrollToBottom(ref));

    act(() => {
      result.current(); // Should not throw
    });
  });
});
