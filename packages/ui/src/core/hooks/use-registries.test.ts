import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';

const mockFetchApi = vi.fn();
vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));

import {
  useRegistries,
  useAddRegistry,
  useRemoveRegistry,
  useSyncRegistry,
} from './use-registries.js';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  mockFetchApi.mockReset();
});

describe('useRegistries', () => {
  it('fetches registries', async () => {
    const data = [{ name: 'default', url: 'https://example.com', priority: 1 }];
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useRegistries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith('/api/registries');
  });

  it('handles fetch error', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRegistries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useAddRegistry', () => {
  it('sends POST request with registry data', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const input = { name: 'my-reg', url: 'https://reg.example.com' };

    const { result } = renderHook(() => useAddRegistry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/registries', {
        method: 'POST',
        body: input,
      }),
    );
  });
});

describe('useRemoveRegistry', () => {
  it('sends DELETE request with encoded name', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const name = 'my registry';

    const { result } = renderHook(() => useRemoveRegistry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(name);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(`/api/registries/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      }),
    );
  });
});

describe('useSyncRegistry', () => {
  it('sends POST request to sync endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const name = 'default';

    const { result } = renderHook(() => useSyncRegistry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(name);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(
        `/api/registries/${encodeURIComponent(name)}/sync`,
        { method: 'POST' },
      ),
    );
  });
});
