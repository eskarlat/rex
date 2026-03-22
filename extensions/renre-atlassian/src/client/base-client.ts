export interface AtlassianClientConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export class AtlassianBaseClient {
  protected readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: AtlassianClientConfig) {
    let domain = config.domain;
    if (domain.startsWith('https://')) {
      domain = domain.slice(8);
    } else if (domain.startsWith('http://')) {
      domain = domain.slice(7);
    }
    while (domain.endsWith('/')) {
      domain = domain.slice(0, -1);
    }
    this.baseUrl = `https://${domain}`;
    const credentials = `${config.email}:${config.apiToken}`;
    this.authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: this.authHeader,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extra,
    };
  }

  private async ensureOk(res: Response): Promise<void> {
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Atlassian API error ${res.status}: ${text}`);
    }
  }

  protected async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.buildHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    await this.ensureOk(res);

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  protected async requestFormData(
    path: string,
    formData: FormData,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'X-Atlassian-Token': 'nocheck',
        ...headers,
      },
      body: formData,
    });

    await this.ensureOk(res);

    if (res.status === 204) {
      return undefined;
    }

    return res.json();
  }

  protected async requestRaw(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.buildHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    await this.ensureOk(res);
    return res;
  }
}
