export interface AtlassianClientConfig {
    domain: string;
    email: string;
    apiToken: string;
}
export declare class AtlassianBaseClient {
    protected readonly baseUrl: string;
    private readonly authHeader;
    constructor(config: AtlassianClientConfig);
    protected request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    protected requestFormData(path: string, formData: FormData, headers?: Record<string, string>): Promise<unknown>;
    protected requestRaw(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<Response>;
}
export declare function createClientFromEnv(): AtlassianClientConfig;
