import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, ApiClientError } from './api-client';
import type { CreateTaskPayload, UpdateTaskPayload } from './types';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    body: null,
    bodyUsed: false,
    clone: vi.fn(),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response;
}

function noContentResponse(): Response {
  return {
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: () => Promise.reject(new Error('No content')),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    body: null,
    bodyUsed: false,
    clone: vi.fn(),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response;
}

describe('ApiClientError', () => {
  it('stores status, statusText, and body', () => {
    const err = new ApiClientError(404, 'Not Found', { detail: 'gone' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiClientError');
    expect(err.status).toBe(404);
    expect(err.statusText).toBe('Not Found');
    expect(err.body).toEqual({ detail: 'gone' });
    expect(err.message).toBe('API Error 404: Not Found');
  });
});

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new ApiClient({
      baseUrl: 'http://localhost:4200',
      projectPath: '/my/project',
    });
  });

  describe('headers', () => {
    it('includes Content-Type and X-RenreKit-Project when projectPath is set', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ name: 'test' }));
      await client.getProject();

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-RenreKit-Project']).toBe('/my/project');
    });

    it('omits X-RenreKit-Project when projectPath is null', async () => {
      const noProjectClient = new ApiClient({ baseUrl: 'http://localhost:4200' });
      mockFetch.mockResolvedValueOnce(jsonResponse({ name: 'test' }));
      await noProjectClient.getProject();

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-RenreKit-Project']).toBeUndefined();
    });
  });

  describe('default baseUrl', () => {
    it('defaults to http://localhost:4200', async () => {
      const defaultClient = new ApiClient({});
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await defaultClient.getProject();

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe('http://localhost:4200/api/project');
    });
  });

  describe('error handling', () => {
    it('throws ApiClientError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'not found' }, 404));

      await expect(client.getProject()).rejects.toThrow(ApiClientError);
      await expect(
        client.getProject().catch((e: ApiClientError) => {
          expect(e.status).toBe(404);
          throw e;
        }),
      ).rejects.toThrow();
    });

    it('handles non-JSON error body gracefully', async () => {
      const response = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        body: null,
        bodyUsed: false,
        clone: vi.fn(),
        arrayBuffer: vi.fn(),
        blob: vi.fn(),
        formData: vi.fn(),
        text: vi.fn(),
      } as unknown as Response;
      mockFetch.mockResolvedValueOnce(response);

      await expect(client.getProject()).rejects.toThrow(ApiClientError);
    });
  });

  describe('getProject', () => {
    it('sends GET /api/project', async () => {
      const projectData = { name: 'test', path: '/my/project', config: {} };
      mockFetch.mockResolvedValueOnce(jsonResponse(projectData));

      const result = await client.getProject();

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/project');
      expect(init.method).toBe('GET');
      expect(result).toEqual(projectData);
    });
  });

  describe('runCommand', () => {
    it('sends POST /api/run with command and args', async () => {
      const cmdResult = { output: 'done', exitCode: 0 };
      mockFetch.mockResolvedValueOnce(jsonResponse(cmdResult));

      const result = await client.runCommand('ext:list', { verbose: true });

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/run');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        command: 'ext:list',
        args: { verbose: true },
      });
      expect(result).toEqual(cmdResult);
    });

    it('sends POST /api/run without args when omitted', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ output: '', exitCode: 0 }));

      await client.runCommand('status');

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(init.body as string)).toEqual({
        command: 'status',
      });
    });
  });

  describe('getStorage', () => {
    it('sends GET /api/settings/extensions/:name', async () => {
      const storageData = { values: { key1: 'val1' } };
      mockFetch.mockResolvedValueOnce(jsonResponse(storageData));

      const result = await client.getStorage('my-ext');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/settings/extensions/my-ext');
      expect(init.method).toBe('GET');
      expect(result).toEqual(storageData);
    });
  });

  describe('setStorage', () => {
    it('sends PUT /api/settings/extensions/:name with key and value', async () => {
      mockFetch.mockResolvedValueOnce(noContentResponse());

      await client.setStorage('my-ext', 'token', 'abc123');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/settings/extensions/my-ext');
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body as string)).toEqual({
        key: 'token',
        value: 'abc123',
      });
    });
  });

  describe('getScheduledTasks', () => {
    it('sends GET /api/scheduler', async () => {
      const tasks = [{ id: '1', cron: '* * * * *', command: 'test' }];
      mockFetch.mockResolvedValueOnce(jsonResponse(tasks));

      const result = await client.getScheduledTasks();

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/scheduler');
      expect(init.method).toBe('GET');
      expect(result).toEqual(tasks);
    });
  });

  describe('createTask', () => {
    it('sends POST /api/scheduler with payload', async () => {
      const payload: CreateTaskPayload = {
        extension_name: 'my-ext',
        cron: '0 * * * *',
        command: 'sync',
      };
      const created = { id: '1', ...payload };
      mockFetch.mockResolvedValueOnce(jsonResponse(created));

      const result = await client.createTask(payload);

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/scheduler');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual(payload);
      expect(result).toEqual(created);
    });
  });

  describe('updateTask', () => {
    it('sends PUT /api/scheduler/:id with payload', async () => {
      const payload: UpdateTaskPayload = { enabled: 0 };
      const updated = { id: '1', enabled: 0 };
      mockFetch.mockResolvedValueOnce(jsonResponse(updated));

      const result = await client.updateTask('1', payload);

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/scheduler/1');
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body as string)).toEqual(payload);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTask', () => {
    it('sends DELETE /api/scheduler/:id', async () => {
      mockFetch.mockResolvedValueOnce(noContentResponse());

      await client.deleteTask('42');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/scheduler/42');
      expect(init.method).toBe('DELETE');
    });
  });

  describe('writeLog', () => {
    it('sends POST /api/logs/write with level, source, and message', async () => {
      mockFetch.mockResolvedValueOnce(noContentResponse());

      await client.writeLog('info', 'ext:my-ext', 'hello from extension');

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:4200/api/logs/write');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        level: 'info',
        source: 'ext:my-ext',
        message: 'hello from extension',
      });
    });

    it('includes data when provided', async () => {
      mockFetch.mockResolvedValueOnce(noContentResponse());

      await client.writeLog('warn', 'ext:test', 'caution', { detail: 42 });

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(init.body as string)).toEqual({
        level: 'warn',
        source: 'ext:test',
        message: 'caution',
        data: { detail: 42 },
      });
    });

    it('omits data field when not provided', async () => {
      mockFetch.mockResolvedValueOnce(noContentResponse());

      await client.writeLog('debug', 'ext:x', 'no data');

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string);
      expect(body).not.toHaveProperty('data');
    });
  });
});
