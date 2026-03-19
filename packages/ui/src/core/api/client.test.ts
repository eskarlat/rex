import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchApi,
  ApiError,
  setActiveProjectPath,
  getActiveProjectPath,
} from './client';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  setActiveProjectPath(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchApi', () => {
  it('should make a GET request and return JSON', async () => {
    const data = { id: 1, name: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });

    const result = await fetchApi<typeof data>('/api/test');

    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      headers: {},
      body: undefined,
    });
  });

  it('should include X-RenreKit-Project header when active project is set', async () => {
    setActiveProjectPath('/path/to/project');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetchApi('/api/test');

    const calledHeaders = mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(calledHeaders['X-RenreKit-Project']).toBe('/path/to/project');
  });

  it('should send body as JSON for POST requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const body = { name: 'test' };
    await fetchApi('/api/test', { method: 'POST', body });

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });

  it('should throw ApiError on non-ok response', async () => {
    const errorBody = { message: 'Not found' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve(errorBody),
    });

    try {
      await fetchApi('/api/test');
      expect.fail('should have thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.status).toBe(404);
    }
  });

  it('should handle 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error('no json')),
    });

    const result = await fetchApi<void>('/api/test');
    expect(result).toBeUndefined();
  });

  it('should handle error response with non-JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(fetchApi('/api/test')).rejects.toThrow(ApiError);
  });
});

describe('setActiveProjectPath / getActiveProjectPath', () => {
  it('should set and get the active project path', () => {
    setActiveProjectPath('/my/project');
    expect(getActiveProjectPath()).toBe('/my/project');
  });

  it('should allow setting to null', () => {
    setActiveProjectPath('/my/project');
    setActiveProjectPath(null);
    expect(getActiveProjectPath()).toBeNull();
  });
});
