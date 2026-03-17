import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchApi = vi.fn();
vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));

import { useProjects, useActiveProject, useSetActiveProject } from './use-projects';

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

describe('useProjects', () => {
  it('calls fetchApi with /api/projects and returns data', async () => {
    const projects = [
      { name: 'proj-a', path: '/a', created_at: '2025-01-01' },
      { name: 'proj-b', path: '/b', created_at: '2025-01-02' },
    ];
    mockFetchApi.mockResolvedValueOnce(projects);

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/projects');
    expect(result.current.data).toEqual(projects);
  });
});

describe('useActiveProject', () => {
  it('calls fetchApi with /api/project and returns data', async () => {
    const project = { name: 'proj-a', path: '/a', created_at: '2025-01-01' };
    mockFetchApi.mockResolvedValueOnce(project);

    const { result } = renderHook(() => useActiveProject(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchApi).toHaveBeenCalledWith('/api/project');
    expect(result.current.data).toEqual(project);
  });

  it('returns null when no active project', async () => {
    mockFetchApi.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useActiveProject(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useSetActiveProject', () => {
  it('calls fetchApi with PUT and the project path', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSetActiveProject(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('/path/to/project');
    });

    await waitFor(() =>
      expect(mockFetchApi).toHaveBeenCalledWith('/api/projects/active', {
        method: 'PUT',
        body: { path: '/path/to/project' },
      }),
    );
  });

  it('invalidates related queries on success', async () => {
    mockFetchApi.mockResolvedValueOnce(undefined);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useSetActiveProject(), { wrapper });

    act(() => {
      result.current.mutate('/some/path');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['extensions'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['vault'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['scheduler'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings'] });
  });
});
