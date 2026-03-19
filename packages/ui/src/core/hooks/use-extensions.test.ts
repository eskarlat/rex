import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchApi = vi.fn();
vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));

import {
  useMarketplace,
  useInstallExtension,
  useActivateExtension,
  useDeactivateExtension,
  useUpdateExtension,
  useRemoveExtension,
} from './use-extensions';

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

describe('useMarketplace', () => {
  it('calls fetchApi with /api/marketplace and returns data', async () => {
    const marketplace = {
      active: [{ name: 'ext-a', version: '1.0.0', type: 'standard', status: 'active' }],
      installed: [],
      available: [],
    };
    mockFetchApi.mockResolvedValueOnce(marketplace);

    const { result } = renderHook(() => useMarketplace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/marketplace');
    expect(result.current.data).toEqual(marketplace);
  });
});

describe('useMarketplace widget metadata', () => {
  it('marketplace response includes widget metadata', async () => {
    const marketplace = {
      active: [{
        name: 'ext-a',
        version: '1.0.0',
        type: 'standard',
        status: 'active',
        widgets: [{ id: 'status', title: 'Status', defaultSize: { w: 4, h: 2 } }],
      }],
      installed: [],
      available: [],
    };
    mockFetchApi.mockResolvedValueOnce(marketplace);

    const { result } = renderHook(() => useMarketplace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.active[0]?.widgets).toHaveLength(1);
    expect(result.current.data?.active[0]?.widgets?.[0]?.id).toBe('status');
  });
});

describe('useInstallExtension', () => {
  it('calls fetchApi with POST to install endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useInstallExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'my-extension', version: '1.2.0' });
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/install', {
        method: 'POST',
        body: { name: 'my-extension', version: '1.2.0' },
      }),
    );
  });
});

describe('useActivateExtension', () => {
  it('calls fetchApi with POST to activate endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useActivateExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'my-extension', version: '1.0.0' });
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/activate', {
        method: 'POST',
        body: { name: 'my-extension', version: '1.0.0' },
      }),
    );
  });
});

describe('useDeactivateExtension', () => {
  it('calls fetchApi with POST to deactivate endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeactivateExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('my-extension');
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/deactivate', {
        method: 'POST',
        body: { name: 'my-extension' },
      }),
    );
  });
});

describe('useUpdateExtension', () => {
  it('calls fetchApi with POST to update endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'my-extension' });
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/update', {
        method: 'POST',
        body: { name: 'my-extension' },
      }),
    );
  });

  it('passes force flag when provided', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'my-extension', force: true });
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/update', {
        method: 'POST',
        body: { name: 'my-extension', force: true },
      }),
    );
  });
});

describe('useRemoveExtension', () => {
  it('calls fetchApi with DELETE and URL-encodes the name', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRemoveExtension(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('@scope/my-extension');
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(
        `/api/extensions/${encodeURIComponent('@scope/my-extension')}`,
        { method: 'DELETE' },
      ),
    );
  });
});
