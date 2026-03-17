import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchApi = vi.fn();
vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));

import {
  useVaultEntries,
  useSetVaultEntry,
  useUpdateVaultEntry,
  useRemoveVaultEntry,
} from './use-vault';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  mockFetchApi.mockReset();
});

describe('useVaultEntries', () => {
  it('calls fetchApi with /api/vault and returns data', async () => {
    const entries = [
      { key: 'API_KEY', created_at: '2025-01-01', updated_at: '2025-01-01' },
      { key: 'SECRET', tags: ['auth'], created_at: '2025-01-02', updated_at: '2025-01-02' },
    ];
    mockFetchApi.mockResolvedValueOnce(entries);

    const { result } = renderHook(() => useVaultEntries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/vault');
    expect(result.current.data).toEqual(entries);
  });
});

describe('useSetVaultEntry', () => {
  it('calls fetchApi with POST to /api/vault', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSetVaultEntry(), {
      wrapper: createWrapper(),
    });

    const data = { key: 'NEW_KEY', value: 'secret-value', secret: true, tags: ['env'] };

    act(() => {
      result.current.mutate(data);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/vault', {
        method: 'POST',
        body: data,
      }),
    );
  });
});

describe('useUpdateVaultEntry', () => {
  it('calls fetchApi with PUT and URL-encodes the key', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateVaultEntry(), {
      wrapper: createWrapper(),
    });

    const data = { key: 'my/special.key', value: 'new-value', secret: false, tags: ['updated'] };

    act(() => {
      result.current.mutate(data);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(
        `/api/vault/${encodeURIComponent('my/special.key')}`,
        {
          method: 'PUT',
          body: { value: 'new-value', secret: false, tags: ['updated'] },
        },
      ),
    );
  });
});

describe('useRemoveVaultEntry', () => {
  it('calls fetchApi with DELETE and URL-encodes the key', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRemoveVaultEntry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('my/special.key');
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(
        `/api/vault/${encodeURIComponent('my/special.key')}`,
        { method: 'DELETE' },
      ),
    );
  });
});
