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
  useScheduledTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTriggerTask,
  useTaskHistory,
} from './use-scheduler.js';

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

describe('useScheduledTasks', () => {
  it('fetches scheduled tasks', async () => {
    const data = [
      {
        id: 1,
        name: 'backup',
        extension_name: 'ext-backup',
        command: 'backup:run',
        cron: '0 * * * *',
        enabled: true,
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useScheduledTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler');
  });

  it('handles fetch error', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useScheduledTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateTask', () => {
  it('sends POST request with task data', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const input = {
      name: 'backup',
      extension_name: 'ext-backup',
      command: 'backup:run',
      cron: '0 * * * *',
    };

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler', {
        method: 'POST',
        body: input,
      })
    );
  });
});

describe('useUpdateTask', () => {
  it('sends PUT request with enabled and cron fields', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);
    const input = { id: 5, enabled: false, cron: '*/5 * * * *' };

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler/5', {
        method: 'PUT',
        body: { enabled: false, cron: '*/5 * * * *' },
      })
    );
  });
});

describe('useDeleteTask', () => {
  it('sends DELETE request with task id', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(3);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler/3', {
        method: 'DELETE',
      })
    );
  });
});

describe('useTriggerTask', () => {
  it('sends POST request to trigger endpoint', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTriggerTask(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(7);
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler/7/trigger', {
        method: 'POST',
      })
    );
  });
});

describe('useTaskHistory', () => {
  it('fetches task history for a valid id', async () => {
    const data = [
      {
        id: 1,
        task_id: 2,
        started_at: '2026-01-01T00:00:00Z',
        finished_at: '2026-01-01T00:01:00Z',
        duration_ms: 60000,
        status: 'success' as const,
      },
    ];
    mockFetchApi.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useTaskHistory(2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetchApi).toHaveBeenCalledWith('/api/scheduler/2/history');
  });

  it('does not fetch when id is 0', () => {
    const { result } = renderHook(() => useTaskHistory(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it('does not fetch when id is negative', () => {
    const { result } = renderHook(() => useTaskHistory(-1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetchApi).not.toHaveBeenCalled();
  });
});
