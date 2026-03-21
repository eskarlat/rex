import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useStorage } from './useStorage';
import type { RenreKitSDK } from '../../core/types';

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
    },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    destroy: vi.fn(),
  };
}

describe('useStorage', () => {
  let mockSDK: RenreKitSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
  });

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return createElement(SDKProvider, { sdk: mockSDK }, children);
  }

  it('starts with loading true and data null', () => {
    const { result } = renderHook(() => useStorage('my-ext'), { wrapper });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('loads extension-scoped data on mount', async () => {
    vi.mocked(mockSDK.storage.list).mockResolvedValue([
      { key: 'my-ext:theme', value: 'dark' },
      { key: 'my-ext:lang', value: 'en' },
      { key: 'other-ext:foo', value: 'bar' },
    ]);

    const { result } = renderHook(() => useStorage('my-ext'), { wrapper });

    await act(async () => {});

    expect(result.current.data).toEqual({ theme: 'dark', lang: 'en' });
    expect(result.current.loading).toBe(false);
  });

  it('set stores value with scoped key', async () => {
    vi.mocked(mockSDK.storage.list).mockResolvedValue([]);

    const { result } = renderHook(() => useStorage('my-ext'), { wrapper });

    await act(async () => {});
    await act(async () => {
      await result.current.set('theme', 'dark');
    });

    expect(mockSDK.storage.set).toHaveBeenCalledWith('my-ext:theme', 'dark');
    expect(result.current.data).toEqual({ theme: 'dark' });
  });

  it('remove deletes value with scoped key', async () => {
    vi.mocked(mockSDK.storage.list).mockResolvedValue([
      { key: 'my-ext:theme', value: 'dark' },
    ]);

    const { result } = renderHook(() => useStorage('my-ext'), { wrapper });

    await act(async () => {});
    await act(async () => {
      await result.current.remove('theme');
    });

    expect(mockSDK.storage.delete).toHaveBeenCalledWith('my-ext:theme');
    expect(result.current.data).toEqual({});
  });

  it('does not update state after unmount', async () => {
    let resolveList!: (value: { key: string; value: string }[]) => void;
    vi.mocked(mockSDK.storage.list).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useStorage('my-ext'), { wrapper });

    unmount();

    await act(async () => {
      resolveList([{ key: 'my-ext:late', value: 'data' }]);
    });

    expect(result.current.data).toBeNull();
  });
});
