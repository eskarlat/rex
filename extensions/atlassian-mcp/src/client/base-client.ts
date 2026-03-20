export interface AtlassianClientConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export class AtlassianBaseClient {
  protected readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: AtlassianClientConfig) {
    this.baseUrl = `https://${config.domain}`;
    this.authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`;
  }

  protected async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Atlassian API error ${res.status}: ${text}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  protected async requestRaw(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Atlassian API error ${res.status}: ${text}`);
    }

    return res;
  }
}

export function createClientFromEnv(): AtlassianClientConfig {
  const domain = process.env['ATLASSIAN_DOMAIN'];
  const email = process.env['ATLASSIAN_EMAIL'];
  const apiToken = process.env['ATLASSIAN_API_TOKEN'];

  if (!domain || !email || !apiToken) {
    throw new Error(
      'Missing Atlassian configuration. Set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN.',
    );
  }

  return { domain, email, apiToken };
}
