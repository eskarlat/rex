export class AtlassianBaseClient {
    baseUrl;
    authHeader;
    constructor(config) {
        const domain = config.domain.replace(/^https?:\/\//, '');
        this.baseUrl = `https://${domain}`;
        this.authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`;
    }
    async request(method, path, body, headers) {
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
            return undefined;
        }
        return res.json();
    }
    async requestFormData(path, formData, headers) {
        const url = `${this.baseUrl}${path}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: this.authHeader,
                'X-Atlassian-Token': 'nocheck',
                ...headers,
            },
            body: formData,
        });
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`Atlassian API error ${res.status}: ${text}`);
        }
        if (res.status === 204) {
            return undefined;
        }
        return res.json();
    }
    async requestRaw(method, path, body, headers) {
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
export function createClientFromEnv() {
    const domain = process.env['ATLASSIAN_DOMAIN'];
    const email = process.env['ATLASSIAN_EMAIL'];
    const apiToken = process.env['ATLASSIAN_API_TOKEN'];
    if (!domain || !email || !apiToken) {
        throw new Error('Missing Atlassian configuration. Set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN.');
    }
    return { domain, email, apiToken };
}
