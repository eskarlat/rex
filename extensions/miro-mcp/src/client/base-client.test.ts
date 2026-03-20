// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MiroBaseClient, createClientFromEnv } from './base-client.js';
import type { MiroClientConfig } from './base-client.js';

class TestClient extends MiroBaseClient {
  testRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method, path, body);
  }

  testRequestRaw(method: string, path: string, body?: unknown): Promise<Response> {
    return this.requestRaw(method, path, body);
  }

  testRequestMultipart<T>(method: string, path: string, formData: FormData): Promise<T> {
    return this.requestMultipart<T>(method, path, formData);
  }
}

function mockResponse(body: string | null, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body ? JSON.parse(body) : undefined),
    text: () => Promise.resolve(body ?? ''),
  } as unknown as Response;
}

describe('MiroBaseClient', () => {
  const config: MiroClientConfig = { accessToken: 'test-token-123' };
  let client: TestClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new TestClient(config);
    fetchMock = vi.fn().mockResolvedValue(mockResponse(JSON.stringify({ id: '1' }), 200));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends Bearer auth header', async () => {
    await client.testRequest('GET', '/boards');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    );
  });

  it('sends JSON content type', async () => {
    await client.testRequest('GET', '/boards');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('sends request body as JSON', async () => {
    const body = { name: 'Test Board' };
    await client.testRequest('POST', '/boards', body);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
  });

  it('returns parsed JSON response', async () => {
    const result = await client.testRequest<{ id: string }>('GET', '/boards');
    expect(result).toEqual({ id: '1' });
  });

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(null, 204));
    const result = await client.testRequest('DELETE', '/boards/1');
    expect(result).toBeUndefined();
  });

  it('throws on error responses', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse('Not found', 404));
    try {
      await client.testRequest('GET', '/boards/999');
      expect.fail('Expected request to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('Miro API error 404: Not found');
    }
  });

  it('requestRaw returns response object', async () => {
    const res = await client.testRequestRaw('GET', '/boards');
    expect(res.status).toBe(200);
  });

  it('requestRaw throws on error', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse('Server error', 500));
    try {
      await client.testRequestRaw('GET', '/boards');
      expect.fail('Expected request to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('Miro API error 500: Server error');
    }
  });

  it('requestMultipart sends FormData without Content-Type', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.png');
    await client.testRequestMultipart('POST', '/boards/1/images', formData);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/1/images',
      expect.objectContaining({
        method: 'POST',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('requestMultipart returns parsed JSON', async () => {
    const formData = new FormData();
    const result = await client.testRequestMultipart<{ id: string }>(
      'POST',
      '/boards/1/images',
      formData,
    );
    expect(result).toEqual({ id: '1' });
  });
});

describe('createClientFromEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns config when env var is set', () => {
    process.env['MIRO_ACCESS_TOKEN'] = 'my-token';
    const config = createClientFromEnv();
    expect(config).toEqual({ accessToken: 'my-token' });
  });

  it('throws when MIRO_ACCESS_TOKEN is missing', () => {
    delete process.env['MIRO_ACCESS_TOKEN'];
    expect(() => createClientFromEnv()).toThrow('Missing Miro configuration');
  });
});
