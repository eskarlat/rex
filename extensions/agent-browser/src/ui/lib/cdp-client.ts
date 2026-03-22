/** Thin CDP WebSocket wrapper with request/response ID tracking and event subscriptions */

type CdpHandler = (params: Record<string, unknown>) => void;

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

export class CdpClient {
  private ws: WebSocket | null = null;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private listeners = new Map<string, Set<CdpHandler>>();
  private _connected = false;

  get connected(): boolean {
    return this._connected;
  }

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.addEventListener('open', () => {
        this._connected = true;
        resolve();
      });

      this.ws.addEventListener('error', () => {
        reject(new Error(`CDP WebSocket error connecting to ${url}`));
      });

      this.ws.addEventListener('close', () => {
        this._connected = false;
        this.rejectAllPending('WebSocket closed');
      });

      this.ws.addEventListener('message', (event) => {
        this.handleMessage(String(event.data));
      });
    });
  }

  send(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.ws || !this._connected) {
      return Promise.reject(new Error('CDP WebSocket not connected'));
    }

    const id = this.nextId++;
    const message = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws!.send(message);
    });
  }

  on(event: string, handler: CdpHandler): () => void {
    let handlers = this.listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this.listeners.set(event, handlers);
    }
    handlers.add(handler);

    return () => {
      handlers!.delete(handler);
      if (handlers!.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  close(): void {
    if (this.ws) {
      this._connected = false;
      this.rejectAllPending('Client closed');
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  private handleMessage(data: string): void {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }

    // Response to a send() call
    if (typeof msg['id'] === 'number') {
      const pending = this.pending.get(msg['id']);
      if (pending) {
        this.pending.delete(msg['id']);
        if (msg['error']) {
          const err = msg['error'] as Record<string, unknown>;
          pending.reject(new Error(String(err['message'] ?? 'CDP error')));
        } else {
          pending.resolve(msg['result']);
        }
      }
      return;
    }

    // Event notification
    if (typeof msg['method'] === 'string') {
      const handlers = this.listeners.get(msg['method']);
      if (handlers) {
        const params = (msg['params'] ?? {}) as Record<string, unknown>;
        for (const handler of handlers) {
          handler(params);
        }
      }
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pending) {
      pending.reject(new Error(reason));
    }
    this.pending.clear();
  }
}
