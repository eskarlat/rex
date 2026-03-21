type EventHandler = (event: { type: string; source: string; data: Record<string, unknown> }) => void;

interface Subscription {
  pattern: string;
  handler: EventHandler;
}

let instance: WsManager | null = null;
let refCount = 0;

class WsManager {
  private ws: WebSocket | null = null;
  private subscriptions: Subscription[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private intentionalClose = false;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/events`;

    this.ws = new WebSocket(wsUrl);

    this.ws.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      // Subscribe to all renre-devtools events
      this.ws?.send(
        JSON.stringify({
          action: 'subscribe',
          patterns: ['ext:renre-devtools:*'],
        })
      );
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as {
          action: string;
          event?: { type: string; source: string; data: Record<string, unknown> };
        };
        if (msg.action === 'event' && msg.event) {
          for (const sub of this.subscriptions) {
            if (this.matchesPattern(sub.pattern, msg.event.type)) {
              sub.handler(msg.event);
            }
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    this.ws.addEventListener('close', () => {
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    });

    this.ws.addEventListener('error', () => {
      this.ws?.close();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private matchesPattern(pattern: string, eventType: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -1);
      return eventType.startsWith(prefix);
    }
    return pattern === eventType;
  }

  subscribe(pattern: string, handler: EventHandler): () => void {
    const sub: Subscription = { pattern, handler };
    this.subscriptions.push(sub);
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== sub);
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions = [];
  }
}

export function acquireWsManager(): WsManager {
  if (!instance) {
    instance = new WsManager();
    instance.connect();
  }
  refCount++;
  return instance;
}

export function releaseWsManager(): void {
  refCount--;
  if (refCount <= 0 && instance) {
    instance.disconnect();
    instance = null;
    refCount = 0;
  }
}
