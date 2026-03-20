const BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

let activeProjectPath: string | null = null;

export function setActiveProjectPath(path: string | null): void {
  activeProjectPath = path;
}

export function getActiveProjectPath(): string | null {
  return activeProjectPath;
}

type AuthFailureListener = () => void;
const authFailureListeners = new Set<AuthFailureListener>();

export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
}

function notifyAuthFailure(): void {
  for (const listener of authFailureListeners) {
    listener();
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

interface FetchApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function fetchApi<T>(path: string, options: FetchApiOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(customHeaders as Record<string, string>),
  };

  if (activeProjectPath) {
    headers['X-RenreKit-Project'] = activeProjectPath;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch (parseError: unknown) {
      // Response may not contain JSON - use null body
      errorBody = String(parseError);
    }
    const error = new ApiError(response.status, response.statusText, errorBody);
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      notifyAuthFailure();
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
