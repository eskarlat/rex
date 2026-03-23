import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchApi = vi.fn();

const { MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    constructor(
      public readonly status: number,
      public readonly statusText: string,
      public readonly body: unknown,
    ) {
      super(`API Error ${status}: ${statusText}`);
    }
  }
  return { MockApiError };
});

vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
  ApiError: MockApiError,
}));

const mockShowToast = vi.fn();
vi.mock('@/core/hooks/use-toast', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

import {
  useMarketplace,
  useExtensionDoc,
  useExtensionChangelog,
  useExtensionReadme,
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
  mockShowToast.mockReset();
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
      active: [
        {
          name: 'ext-a',
          version: '1.0.0',
          type: 'standard',
          status: 'active',
          widgets: [{ id: 'status', title: 'Status', defaultSize: { w: 4, h: 2 } }],
        },
      ],
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

describe('useExtensionDoc', () => {
  it('fetches doc by type and extracts the correct field', async () => {
    mockFetchApi.mockResolvedValueOnce({ readme: '# Hello' });

    const { result } = renderHook(() => useExtensionDoc('my-ext', 'readme'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/my-ext/readme');
    expect(result.current.data).toBe('# Hello');
  });

  it('does not fetch when name is undefined', () => {
    renderHook(() => useExtensionDoc(undefined, 'changelog'), {
      wrapper: createWrapper(),
    });

    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it('returns null when API responds with 404', async () => {
    mockFetchApi.mockRejectedValueOnce(new MockApiError(404, 'Not Found', null));

    const { result } = renderHook(() => useExtensionDoc('my-ext', 'readme'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('does not retry on 404 errors', async () => {
    const error404 = new MockApiError(404, 'Not Found', null);
    mockFetchApi.mockRejectedValue(error404);

    const { result } = renderHook(() => useExtensionDoc('my-ext', 'readme'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Should only be called once (no retries for 404)
    expect(mockFetchApi).toHaveBeenCalledTimes(1);
  });

  it('returns null when response has no matching field', async () => {
    mockFetchApi.mockResolvedValueOnce({});

    const { result } = renderHook(() => useExtensionDoc('my-ext', 'readme'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useExtensionChangelog', () => {
  it('fetches changelog for a given extension name', async () => {
    mockFetchApi.mockResolvedValueOnce({ changelog: '## [1.0.0]\n\n- Initial release' });

    const { result } = renderHook(() => useExtensionChangelog('my-ext'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/my-ext/changelog');
    expect(result.current.data).toBe('## [1.0.0]\n\n- Initial release');
  });

  it('does not fetch when name is undefined', () => {
    renderHook(() => useExtensionChangelog(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockFetchApi).not.toHaveBeenCalled();
  });
});

describe('useExtensionReadme', () => {
  it('fetches readme for a given extension name', async () => {
    mockFetchApi.mockResolvedValueOnce({ readme: '# Hello World\n\nA simple extension.' });

    const { result } = renderHook(() => useExtensionReadme('my-ext'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/extensions/my-ext/readme');
    expect(result.current.data).toBe('# Hello World\n\nA simple extension.');
  });

  it('does not fetch when name is undefined', () => {
    renderHook(() => useExtensionReadme(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockFetchApi).not.toHaveBeenCalled();
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

  it('shows success toast on install', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useInstallExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'my-ext' });
    });

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith({ title: 'Installed my-ext' }));
  });

  it('shows error toast on install failure', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useInstallExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'my-ext' });
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Failed to install my-ext',
        description: 'network',
        variant: 'destructive',
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

  it('shows success toast on activate', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useActivateExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'my-ext', version: '1.0.0' });
    });

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith({ title: 'Activated my-ext' }));
  });

  it('shows error toast on activate failure', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('activation failed'));
    const { result } = renderHook(() => useActivateExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'my-ext', version: '1.0.0' });
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Failed to activate my-ext',
        description: 'activation failed',
        variant: 'destructive',
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

  it('shows success toast on deactivate', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeactivateExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('my-ext');
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({ title: 'Deactivated my-ext' }),
    );
  });

  it('shows error toast on deactivate failure', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('deactivation failed'));
    const { result } = renderHook(() => useDeactivateExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('my-ext');
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Failed to deactivate my-ext',
        description: 'deactivation failed',
        variant: 'destructive',
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

  it('shows error toast on update failure', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('update failed'));
    const { result } = renderHook(() => useUpdateExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'my-ext' });
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Failed to update my-ext',
        description: 'update failed',
        variant: 'destructive',
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

  it('shows success toast on uninstall', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useRemoveExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('my-ext');
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({ title: 'Uninstalled my-ext' }),
    );
  });

  it('shows error toast on uninstall failure', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('remove failed'));
    const { result } = renderHook(() => useRemoveExtension(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('my-ext');
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Failed to uninstall my-ext',
        description: 'remove failed',
        variant: 'destructive',
      }),
    );
  });
});
