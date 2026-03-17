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
  useSettings,
  useUpdateSettings,
  useExtensionSettings,
  useUpdateExtensionSettings,
} from './use-settings.js';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

beforeEach(() => {
  mockFetchApi.mockReset();
});

describe('useSettings', () => {
  it('fetches settings', async () => {
    const data = {
      registries: [],
      settings: { port: 4200, theme: 'dark', logLevel: 'info' },
      extensionConfigs: {},
    };
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith('/api/settings');
  });

  it('handles fetch error', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useUpdateSettings', () => {
  it('sends PUT request with full config', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const input = {
      registries: [],
      settings: { port: 4200, theme: 'light' },
      extensionConfigs: {},
    };

    const { result } = renderHook(() => useUpdateSettings(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/settings', {
        method: 'PUT',
        body: input,
      })
    );
  });
});

describe('useExtensionSettings', () => {
  it('fetches extension settings for a given name', async () => {
    const data = { apiKey: 'resolved-value', timeout: '30' };
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useExtensionSettings('my-ext'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith(
      '/api/settings/extensions/my-ext'
    );
  });

  it('encodes extension name in URL', async () => {
    mockFetchApi.mockResolvedValueOnce({});

    const { result } = renderHook(
      () => useExtensionSettings('my ext/special'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith(
      `/api/settings/extensions/${encodeURIComponent('my ext/special')}`
    );
  });

  it('does not fetch when name is empty', () => {
    const { result } = renderHook(() => useExtensionSettings(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetchApi).not.toHaveBeenCalled();
  });
});

describe('useUpdateExtensionSettings', () => {
  it('sends PUT request with fieldName and mapping', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const input = { fieldName: 'apiKey', mapping: { source: 'direct' as const, value: 'new-key' } };

    const { result } = renderHook(
      () => useUpdateExtensionSettings('my-ext'),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/api/settings/extensions/my-ext',
        { method: 'PUT', body: input }
      )
    );
  });
});
