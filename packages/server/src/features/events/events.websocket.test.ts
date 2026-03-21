import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../../core/utils/event-hub.js', () => {
  const listeners: Array<(event: { type: string; source: string; data: Record<string, unknown>; timestamp: string }) => void> = [];
  return {
    publishEvent: vi.fn((event: { type: string; source: string; data: Record<string, unknown> }) => {
      const full = { ...event, timestamp: new Date().toISOString() };
      for (const fn of listeners) {
        fn(full);
      }
    }),
    subscribeEvents: vi.fn((fn: (event: { type: string; source: string; data: Record<string, unknown>; timestamp: string }) => void) => {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    }),
    matchesPattern: vi.fn((pattern: string, eventType: string) => {
      if (pattern === '*') return true;
      if (!pattern.includes('*')) return pattern === eventType;
      const prefix = pattern.split('*')[0] ?? '';
      return eventType.startsWith(prefix);
    }),
  };
});

const { default: eventsWebsocket, handleWsPublish, handleWsSubscribe, handleWsUnsubscribe } =
  await import('./events.websocket.js');
const { publishEvent, subscribeEvents } = await import('../../core/utils/event-hub.js');

describe('events routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(eventsWebsocket);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/events', () => {
    it('publishes an event and returns 204', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/events',
        payload: { type: 'ext:test:done', source: 'ext:test', data: { id: 1 } },
      });

      expect(response.statusCode).toBe(204);
      expect(publishEvent).toHaveBeenCalledWith({
        type: 'ext:test:done',
        source: 'ext:test',
        data: { id: 1 },
      });
    });

    it('returns 400 when type is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/events',
        payload: { source: 'ext:test' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 400 when source is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/events',
        payload: { type: 'ext:test:done' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('defaults data to empty object when omitted', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/events',
        payload: { type: 'ext:test:ping', source: 'ext:test' },
      });

      expect(publishEvent).toHaveBeenCalledWith({
        type: 'ext:test:ping',
        source: 'ext:test',
        data: {},
      });
    });
  });

  describe('handleWsPublish', () => {
    it('publishes event when type and source are present', () => {
      handleWsPublish({
        action: 'publish',
        event: { type: 'ext:a:done', source: 'ext:a', data: { x: 1 } },
      });

      expect(publishEvent).toHaveBeenCalledWith({
        type: 'ext:a:done',
        source: 'ext:a',
        data: { x: 1 },
      });
    });

    it('does nothing when event type is missing', () => {
      vi.mocked(publishEvent).mockClear();
      handleWsPublish({ action: 'publish', event: { source: 'ext:a' } });
      expect(publishEvent).not.toHaveBeenCalled();
    });

    it('does nothing when event source is missing', () => {
      vi.mocked(publishEvent).mockClear();
      handleWsPublish({ action: 'publish', event: { type: 'ext:a:done' } });
      expect(publishEvent).not.toHaveBeenCalled();
    });

    it('defaults data to empty object', () => {
      handleWsPublish({
        action: 'publish',
        event: { type: 'ext:a:ping', source: 'ext:a' },
      });

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({ data: {} }),
      );
    });
  });

  describe('handleWsSubscribe', () => {
    it('sets patterns and subscribes', () => {
      const state = { patterns: [] as string[], unsubscribe: null as (() => void) | null };
      const handler = vi.fn();

      handleWsSubscribe({ action: 'subscribe', patterns: ['ext:*'] }, state, handler);

      expect(state.patterns).toEqual(['ext:*']);
      expect(subscribeEvents).toHaveBeenCalledWith(handler);
      expect(state.unsubscribe).not.toBeNull();
    });

    it('does not re-subscribe if already subscribed', () => {
      const unsub = vi.fn();
      const state = { patterns: ['old:*'], unsubscribe: unsub };
      const handler = vi.fn();

      vi.mocked(subscribeEvents).mockClear();
      handleWsSubscribe({ action: 'subscribe', patterns: ['new:*'] }, state, handler);

      expect(state.patterns).toEqual(['new:*']);
      expect(subscribeEvents).not.toHaveBeenCalled();
    });

    it('ignores when patterns is not an array', () => {
      const state = { patterns: [] as string[], unsubscribe: null as (() => void) | null };
      handleWsSubscribe({ action: 'subscribe' }, state, vi.fn());
      expect(state.patterns).toEqual([]);
    });
  });

  describe('handleWsUnsubscribe', () => {
    it('clears patterns and calls unsubscribe', () => {
      const unsub = vi.fn();
      const state = { patterns: ['ext:*'], unsubscribe: unsub };

      handleWsUnsubscribe(state);

      expect(state.patterns).toEqual([]);
      expect(unsub).toHaveBeenCalled();
      expect(state.unsubscribe).toBeNull();
    });

    it('handles already-unsubscribed state', () => {
      const state = { patterns: ['ext:*'], unsubscribe: null as (() => void) | null };

      expect(() => handleWsUnsubscribe(state)).not.toThrow();
      expect(state.patterns).toEqual([]);
    });
  });
});
