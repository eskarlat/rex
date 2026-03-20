export interface MiroClientConfig {
    accessToken: string;
}
export declare class MiroBaseClient {
    protected readonly baseUrl: string;
    private readonly authHeader;
    constructor(config: MiroClientConfig);
    private doFetch;
    private parseResponse;
    protected request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    protected requestRaw(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<Response>;
    protected requestMultipart<T>(method: string, path: string, formData: FormData): Promise<T>;
}
export declare function createClientFromEnv(): MiroClientConfig;
