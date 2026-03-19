import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchApi = vi.fn();
vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));

import { useDashboardLayout, useSaveDashboardLayout } from './use-dashboard-layout';

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

describe('useDashboardLayout', () => {
  it('fetches /api/dashboard/layout and returns data', async () => {
    const layout = {
      widgets: [
        {
          id: 'ext:widget',
          extensionName: 'ext',
          widgetId: 'widget',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    };
    mockFetchApi.mockResolvedValueOnce(layout);

    const { result } = renderHook(() => useDashboardLayout(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/dashboard/layout');
    expect(result.current.data).toEqual(layout);
  });
});

describe('useSaveDashboardLayout', () => {
  it('PUTs layout and invalidates query', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSaveDashboardLayout(), {
      wrapper: createWrapper(),
    });

    const layout = { widgets: [] };
    act(() => {
      result.current.mutate(layout);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/dashboard/layout', {
        method: 'PUT',
        body: layout,
      }),
    );
  });
});
