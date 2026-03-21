export interface MiroClientConfig {
  accessToken: string;
}

export class MiroBaseClient {
  protected readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: MiroClientConfig) {
    this.baseUrl = 'https://api.miro.com/v2';
    this.authHeader = `Bearer ${config.accessToken}`;
  }

  private async doFetch(url: string, init: RequestInit): Promise<Response> {
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Miro API error ${res.status}: ${text}`);
    }
    return res;
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  protected async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.doFetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.parseResponse<T>(res);
  }

  protected async requestRaw(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.doFetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  protected async requestMultipart<T>(
    method: string,
    path: string,
    formData: FormData,
  ): Promise<T> {
    const res = await this.doFetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
      body: formData,
    });
    return this.parseResponse<T>(res);
  }
}

export function createClientFromEnv(): MiroClientConfig {
  const accessToken = process.env['MIRO_ACCESS_TOKEN'];

  if (!accessToken) {
    throw new Error('Missing Miro configuration. Set MIRO_ACCESS_TOKEN environment variable.');
  }

  return { accessToken };
}
