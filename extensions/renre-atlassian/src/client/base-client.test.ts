import { AtlassianBaseClient } from './base-client.js';

class TestClient extends AtlassianBaseClient {
  testRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method, path, body);
  }
  testRequestRaw(method: string, path: string): Promise<Response> {
    return this.requestRaw(method, path);
  }
  testRequestFormData(path: string, formData: FormData): Promise<unknown> {
    return this.requestFormData(path, formData);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

const defaultConfig = {
  domain: 'company.atlassian.net',
  email: 'user@example.com',
  apiToken: 'test-token-123',
};

function createMockResponse(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ id: 1 }),
    text: vi.fn().mockResolvedValue('response text'),
    ...overrides,
  } as unknown as Response;
}

describe('AtlassianBaseClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(createMockResponse());
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('builds correct baseUrl from plain domain', () => {
      const client = new TestClient(defaultConfig);
      expect(client.getBaseUrl()).toBe('https://company.atlassian.net');
    });

    it('strips protocol from domain', () => {
      const client = new TestClient({ ...defaultConfig, domain: 'https://company.atlassian.net' });
      expect(client.getBaseUrl()).toBe('https://company.atlassian.net');
    });

    it('strips http protocol from domain', () => {
      const client = new TestClient({ ...defaultConfig, domain: 'http://company.atlassian.net' });
      expect(client.getBaseUrl()).toBe('https://company.atlassian.net');
    });

    it('strips trailing slashes from domain', () => {
      const client = new TestClient({ ...defaultConfig, domain: 'company.atlassian.net///' });
      expect(client.getBaseUrl()).toBe('https://company.atlassian.net');
    });

    it('strips protocol and trailing slashes together', () => {
      const client = new TestClient({
        ...defaultConfig,
        domain: 'https://company.atlassian.net/',
      });
      expect(client.getBaseUrl()).toBe('https://company.atlassian.net');
    });

    it('builds correct auth header (Basic base64 of email:apiToken)', async () => {
      const client = new TestClient(defaultConfig);
      await client.testRequest('GET', '/test');

      const expectedAuth = `Basic ${Buffer.from('user@example.com:test-token-123').toString('base64')}`;
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expectedAuth,
          }),
        }),
      );
    });
  });

  describe('request()', () => {
    let client: TestClient;

    beforeEach(() => {
      client = new TestClient(defaultConfig);
    });

    it('makes correct HTTP call with headers', async () => {
      await client.testRequest('GET', '/rest/api/3/issue/TEST-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://company.atlassian.net/rest/api/3/issue/TEST-1',
        {
          method: 'GET',
          headers: {
            Authorization: expect.stringContaining('Basic '),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: undefined,
        },
      );
    });

    it('sends JSON body when provided', async () => {
      const body = { fields: { summary: 'Test' } };
      await client.testRequest('POST', '/rest/api/3/issue', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });

    it('throws on non-ok response with status code and body text', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 404,
          text: vi.fn().mockResolvedValue('Not Found'),
        }),
      );

      await expect(client.testRequest('GET', '/bad')).rejects.toThrow(
        'Atlassian API error 404: Not Found',
      );
    });

    it('throws with "Unknown error" when text() fails on error response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 500,
          text: vi.fn().mockRejectedValue(new Error('stream error')),
        }),
      );

      await expect(client.testRequest('GET', '/bad')).rejects.toThrow(
        'Atlassian API error 500: Unknown error',
      );
    });

    it('returns undefined for 204 status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 204,
          json: vi.fn(),
        }),
      );

      const result = await client.testRequest('DELETE', '/rest/api/3/issue/TEST-1');
      expect(result).toBeUndefined();
    });

    it('parses and returns JSON for successful response', async () => {
      const data = { id: '123', key: 'TEST-1' };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          json: vi.fn().mockResolvedValue(data),
        }),
      );

      const result = await client.testRequest('GET', '/rest/api/3/issue/TEST-1');
      expect(result).toEqual(data);
    });
  });

  describe('requestRaw()', () => {
    it('returns raw Response object', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new TestClient(defaultConfig);
      const result = await client.testRequestRaw('GET', '/rest/api/3/issue/TEST-1');

      expect(result).toBe(mockResponse);
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 403,
          text: vi.fn().mockResolvedValue('Forbidden'),
        }),
      );

      const client = new TestClient(defaultConfig);
      await expect(client.testRequestRaw('GET', '/bad')).rejects.toThrow(
        'Atlassian API error 403: Forbidden',
      );
    });
  });

  describe('requestFormData()', () => {
    it('sends FormData with X-Atlassian-Token header', async () => {
      const client = new TestClient(defaultConfig);
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      await client.testRequestFormData('/rest/api/3/issue/TEST-1/attachments', formData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://company.atlassian.net/rest/api/3/issue/TEST-1/attachments',
        {
          method: 'POST',
          headers: {
            Authorization: expect.stringContaining('Basic '),
            'X-Atlassian-Token': 'nocheck',
          },
          body: formData,
        },
      );
    });

    it('returns undefined for 204 status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          status: 204,
        }),
      );

      const client = new TestClient(defaultConfig);
      const formData = new FormData();
      const result = await client.testRequestFormData('/path', formData);
      expect(result).toBeUndefined();
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 413,
          text: vi.fn().mockResolvedValue('Payload Too Large'),
        }),
      );

      const client = new TestClient(defaultConfig);
      const formData = new FormData();
      await expect(client.testRequestFormData('/path', formData)).rejects.toThrow(
        'Atlassian API error 413: Payload Too Large',
      );
    });
  });
});
