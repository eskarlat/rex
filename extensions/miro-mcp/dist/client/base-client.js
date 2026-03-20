export class MiroBaseClient {
    baseUrl;
    authHeader;
    constructor(config) {
        this.baseUrl = 'https://api.miro.com/v2';
        this.authHeader = `Bearer ${config.accessToken}`;
    }
    async doFetch(url, init) {
        const res = await fetch(url, init);
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`Miro API error ${res.status}: ${text}`);
        }
        return res;
    }
    async parseResponse(res) {
        if (res.status === 204)
            return undefined;
        return res.json();
    }
    async request(method, path, body, headers) {
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
        return this.parseResponse(res);
    }
    async requestRaw(method, path, body, headers) {
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
    async requestMultipart(method, path, formData) {
        const res = await this.doFetch(`${this.baseUrl}${path}`, {
            method,
            headers: {
                Authorization: this.authHeader,
                Accept: 'application/json',
            },
            body: formData,
        });
        return this.parseResponse(res);
    }
}
export function createClientFromEnv() {
    const accessToken = process.env['MIRO_ACCESS_TOKEN'];
    if (!accessToken) {
        throw new Error('Missing Miro configuration. Set MIRO_ACCESS_TOKEN environment variable.');
    }
    return { accessToken };
}
