import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CdpClient } from './cdp-client.js';

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];

  private eventHandlers = new Map<string, Set<Function>>();
  readyState = 0;
  sent: string[] = [];

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  addEventListener(event: string, handler: Function): void {
    let handlers = this.eventHandlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
    }
    handlers.add(handler);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = 3;
    this.emit('close', {});
  }

  // Test helpers
  emit(event: string, data: Record<string, unknown>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  simulateOpen(): void {
    this.readyState = 1;
    this.emit('open', {});
  }

  simulateMessage(data: unknown): void {
    this.emit('message', { data: JSON.stringify(data) });
  }

  simulateError(): void {
    this.emit('error', {});
  }
}

// Install mock
vi.stubGlobal('WebSocket', MockWebSocket);

describe('CdpClient', () => {
  let client: CdpClient;

  beforeEach(() => {
    MockWebSocket.instances = [];
    client = new CdpClient();
  });

  describe('connect', () => {
    it('resolves when WebSocket opens', async () => {
      const connectPromise = client.connect('ws://localhost:9222/devtools/page/1');
      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await connectPromise;
      expect(client.connected).toBe(true);
    });

    it('rejects on WebSocket error', async () => {
      const connectPromise = client.connect('ws://localhost:9222/devtools/page/1');
      const ws = MockWebSocket.instances[0]!;
      ws.simulateError();
      await expect(connectPromise).rejects.toThrow('CDP WebSocket error');
    });
  });

  describe('send', () => {
    it('sends JSON message with incrementing id', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      const ws = MockWebSocket.instances[0]!;
      const sendPromise = client.send('Page.navigate', { url: 'https://example.com' });

      // Respond
      ws.simulateMessage({ id: 1, result: { frameId: 'f1' } });
      const result = await sendPromise;
      expect(result).toEqual({ frameId: 'f1' });

      const sent = JSON.parse(ws.sent[0]!);
      expect(sent).toEqual({
        id: 1,
        method: 'Page.navigate',
        params: { url: 'https://example.com' },
      });
    });

    it('rejects when not connected', async () => {
      await expect(client.send('Page.navigate')).rejects.toThrow('not connected');
    });

    it('rejects on CDP error response', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      const ws = MockWebSocket.instances[0]!;
      const sendPromise = client.send('Page.navigate', { url: 'invalid' });
      ws.simulateMessage({ id: 1, error: { message: 'Invalid URL' } });

      await expect(sendPromise).rejects.toThrow('Invalid URL');
    });

    it('rejects all pending on close', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      const ws = MockWebSocket.instances[0]!;
      const p1 = client.send('Page.navigate', { url: 'a' });
      const p2 = client.send('Page.navigate', { url: 'b' });

      ws.emit('close', {});

      await expect(p1).rejects.toThrow('closed');
      await expect(p2).rejects.toThrow('closed');
    });
  });

  describe('on', () => {
    it('receives CDP events', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      const ws = MockWebSocket.instances[0]!;
      const frames: unknown[] = [];
      client.on('Page.screencastFrame', (params) => frames.push(params));

      ws.simulateMessage({
        method: 'Page.screencastFrame',
        params: { data: 'base64data', sessionId: 1 },
      });

      expect(frames).toHaveLength(1);
      expect(frames[0]).toEqual({ data: 'base64data', sessionId: 1 });
    });

    it('returns unsubscribe function', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      const ws = MockWebSocket.instances[0]!;
      const events: unknown[] = [];
      const unsub = client.on('Page.loadEventFired', (params) => events.push(params));

      ws.simulateMessage({ method: 'Page.loadEventFired', params: { timestamp: 1 } });
      unsub();
      ws.simulateMessage({ method: 'Page.loadEventFired', params: { timestamp: 2 } });

      expect(events).toHaveLength(1);
    });
  });

  describe('close', () => {
    it('disconnects and clears state', async () => {
      const connectPromise = client.connect('ws://localhost:9222');
      MockWebSocket.instances[0]!.simulateOpen();
      await connectPromise;

      client.close();
      expect(client.connected).toBe(false);
    });
  });
});
