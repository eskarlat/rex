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
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from './use-notifications.js';

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

describe('useNotifications', () => {
  it('fetches notifications', async () => {
    const data = [{ id: 1, title: 'Test', variant: 'info', read: 0 }];
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith('/api/notifications');
  });

  it('passes query params', async () => {
    mockFetchApi.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () => useNotifications({ unreadOnly: true, limit: 10 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith(
      expect.stringContaining('unreadOnly=true'),
    );
    expect(mockFetchApi).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
    );
  });
});

describe('useUnreadCount', () => {
  it('fetches unread count', async () => {
    mockFetchApi.mockResolvedValueOnce({ unread: 5 });

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ unread: 5 });
    expect(mockFetchApi).toHaveBeenCalledWith('/api/notifications/count');
  });
});

describe('useMarkRead', () => {
  it('sends PATCH request', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMarkRead(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/notifications/1/read', {
        method: 'PATCH',
      }),
    );
  });
});

describe('useMarkAllRead', () => {
  it('sends PATCH request to read-all', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMarkAllRead(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/notifications/read-all', {
        method: 'PATCH',
      }),
    );
  });
});

describe('useDeleteNotification', () => {
  it('sends DELETE request', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(3);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/notifications/3', {
        method: 'DELETE',
      }),
    );
  });
});
