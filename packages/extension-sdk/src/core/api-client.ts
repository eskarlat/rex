import type {
  ProjectContext,
  CommandResult,
  StorageEntry,
  ScheduledTask,
  CreateTaskPayload,
  UpdateTaskPayload,
} from './types';

/** Error thrown when the dashboard API returns a non-ok response. */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiClientError';
  }
}

interface ApiClientOptions {
  baseUrl?: string;
  projectPath?: string | null;
}

interface FetchOptions {
  method: string;
  body?: unknown;
}

/**
 * Lightweight HTTP client for the RenreKit dashboard REST API.
 * Designed for use by extension authors.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly projectPath: string | null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:4200';
    this.projectPath = options.projectPath ?? null;
  }

  /** Internal fetch wrapper that adds standard headers and error handling. */
  private async fetch<T>(path: string, options: FetchOptions): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.projectPath) {
      headers['X-RenreKit-Project'] = this.projectPath;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }
      throw new ApiClientError(response.status, response.statusText, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  /** GET /api/project — retrieve the current project context. */
  async getProject(): Promise<ProjectContext> {
    return this.fetch<ProjectContext>('/api/project', { method: 'GET' });
  }

  /** POST /api/run — execute a CLI command through the dashboard. */
  async runCommand(command: string, args?: Record<string, unknown>): Promise<CommandResult> {
    const body: Record<string, unknown> = { command };
    if (args !== undefined) {
      body['args'] = args;
    }
    return this.fetch<CommandResult>('/api/run', { method: 'POST', body });
  }

  /** GET /api/settings/extensions/:name — read extension storage/config. */
  async getStorage(extensionName: string): Promise<unknown> {
    return this.fetch<unknown>(`/api/settings/extensions/${extensionName}`, { method: 'GET' });
  }

  /** PUT /api/settings/extensions/:name — write a key-value pair to extension storage. */
  async setStorage(extensionName: string, key: string, value: string): Promise<void> {
    return this.fetch<void>(`/api/settings/extensions/${extensionName}`, {
      method: 'PUT',
      body: { key, value },
    });
  }

  /** GET /api/settings/extensions/:name/keys/:key — read a single storage value. */
  async getStorageValue(extensionName: string, key: string): Promise<string | null> {
    return this.fetch<string | null>(`/api/settings/extensions/${extensionName}/keys/${key}`, {
      method: 'GET',
    });
  }

  /** DELETE /api/settings/extensions/:name/keys/:key — delete a storage key. */
  async deleteStorage(extensionName: string, key: string): Promise<void> {
    return this.fetch<void>(`/api/settings/extensions/${extensionName}/keys/${key}`, {
      method: 'DELETE',
    });
  }

  /** GET /api/settings/extensions/:name/keys — list all storage entries. */
  async listStorage(extensionName: string): Promise<StorageEntry[]> {
    return this.fetch<StorageEntry[]>(`/api/settings/extensions/${extensionName}/keys`, {
      method: 'GET',
    });
  }

  /** GET /api/scheduler — list all scheduled tasks. */
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return this.fetch<ScheduledTask[]>('/api/scheduler', { method: 'GET' });
  }

  /** POST /api/scheduler — create a new scheduled task. */
  async createTask(payload: CreateTaskPayload): Promise<ScheduledTask> {
    return this.fetch<ScheduledTask>('/api/scheduler', {
      method: 'POST',
      body: payload,
    });
  }

  /** PUT /api/scheduler/:id — update an existing scheduled task. */
  async updateTask(id: string, payload: UpdateTaskPayload): Promise<ScheduledTask> {
    return this.fetch<ScheduledTask>(`/api/scheduler/${id}`, {
      method: 'PUT',
      body: payload,
    });
  }

  /** DELETE /api/scheduler/:id — delete a scheduled task. */
  async deleteTask(id: string): Promise<void> {
    return this.fetch<void>(`/api/scheduler/${id}`, { method: 'DELETE' });
  }

  /** POST /api/events — publish an inter-extension event. */
  async publishEvent(type: string, source: string, data: Record<string, unknown>): Promise<void> {
    return this.fetch<void>('/api/events', {
      method: 'POST',
      body: { type, source, data },
    });
  }

  /** POST /api/notifications — create a persistent notification. */
  async createNotification(payload: {
    extension_name: string;
    title: string;
    message: string;
    variant?: string;
    action_url?: string;
  }): Promise<void> {
    return this.fetch<void>('/api/notifications', { method: 'POST', body: payload });
  }

  /** POST /api/logs/write — write a log entry from an extension. */
  async writeLog(
    level: string,
    source: string,
    message: string,
    data?: unknown,
  ): Promise<void> {
    const body: Record<string, unknown> = { level, source, message };
    if (data !== undefined) {
      body['data'] = data;
    }
    return this.fetch<void>('/api/logs/write', { method: 'POST', body });
  }
}
