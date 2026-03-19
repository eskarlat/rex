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
      delete: vi.fn(),
      list: vi.fn(),
    },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
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

  it('fetches value on mount', async () => {
    vi.mocked(mockSDK.storage.get).mockResolvedValue('stored-value');

    const { result } = renderHook(() => useStorage('my-key'), { wrapper });

    // Initially null before async fetch completes
    expect(result.current[0]).toBeNull();

    await act(async () => {
      // Let the useEffect resolve
    });

    expect(mockSDK.storage.get).toHaveBeenCalledWith('my-key');
    expect(result.current[0]).toBe('stored-value');
  });

  it('setValue updates storage and local state', async () => {
    vi.mocked(mockSDK.storage.get).mockResolvedValue(null);

    const { result } = renderHook(() => useStorage('my-key'), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    await act(async () => {
      await result.current[1]('new-value');
    });

    expect(mockSDK.storage.set).toHaveBeenCalledWith('my-key', 'new-value');
    expect(result.current[0]).toBe('new-value');
  });

  it('does not update state after unmount', async () => {
    let resolveGet!: (value: string | null) => void;
    vi.mocked(mockSDK.storage.get).mockImplementation(
      () => new Promise((resolve) => { resolveGet = resolve; }),
    );

    const { result, unmount } = renderHook(() => useStorage('my-key'), { wrapper });

    // Unmount before the get resolves
    unmount();

    // Resolve after unmount — should not throw or update state
    await act(async () => {
      resolveGet('late-value');
    });

    // State should still be null (the cancelled flag prevents update)
    expect(result.current[0]).toBeNull();
  });

  it('returns null when storage has no value', async () => {
    vi.mocked(mockSDK.storage.get).mockResolvedValue(null);

    const { result } = renderHook(() => useStorage('missing-key'), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    expect(result.current[0]).toBeNull();
  });
});
