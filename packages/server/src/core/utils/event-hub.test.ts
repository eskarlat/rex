import { describe, it, expect, beforeEach } from 'vitest';
import {
  publishEvent,
  subscribeEvents,
  getRecentEvents,
  matchesPattern,
  _reset,
} from './event-hub.js';

describe('event-hub', () => {
  beforeEach(() => {
    _reset();
  });

  describe('publishEvent', () => {
    it('adds a timestamped entry to the buffer', () => {
      publishEvent({ type: 'ext:test:done', source: 'ext:test', data: { id: 1 } });

      const events = getRecentEvents();
      expect(events).toHaveLength(1);
      expect(events[0]!.type).toBe('ext:test:done');
      expect(events[0]!.source).toBe('ext:test');
      expect(events[0]!.data).toEqual({ id: 1 });
      expect(events[0]!.timestamp).toBeTruthy();
    });

    it('caps buffer at MAX_BUFFER_SIZE', () => {
      for (let i = 0; i < 510; i++) {
        publishEvent({ type: `event-${i}`, source: 'test', data: {} });
      }

      const events = getRecentEvents(600);
      expect(events.length).toBeLessThanOrEqual(500);
    });

    it('notifies all subscribers', () => {
      const received: string[] = [];
      subscribeEvents((e) => received.push(e.type));
      subscribeEvents((e) => received.push(`copy:${e.type}`));

      publishEvent({ type: 'ext:a:ping', source: 'ext:a', data: {} });

      expect(received).toEqual(['ext:a:ping', 'copy:ext:a:ping']);
    });
  });

  describe('subscribeEvents / unsubscribe', () => {
    it('stops receiving events after unsubscribe', () => {
      const received: string[] = [];
      const unsub = subscribeEvents((e) => received.push(e.type));

      publishEvent({ type: 'before', source: 'test', data: {} });
      unsub();
      publishEvent({ type: 'after', source: 'test', data: {} });

      expect(received).toEqual(['before']);
    });
  });

  describe('getRecentEvents', () => {
    it('returns copies (not references)', () => {
      publishEvent({ type: 'test', source: 'test', data: { val: 1 } });
      const events = getRecentEvents();
      events[0]!.data['val'] = 99;

      const fresh = getRecentEvents();
      expect(fresh[0]!.data['val']).toBe(1);
    });

    it('respects limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        publishEvent({ type: `e-${i}`, source: 'test', data: {} });
      }

      expect(getRecentEvents(3)).toHaveLength(3);
    });
  });

  describe('matchesPattern', () => {
    it('matches exact string', () => {
      expect(matchesPattern('ext:a:done', 'ext:a:done')).toBe(true);
      expect(matchesPattern('ext:a:done', 'ext:b:done')).toBe(false);
    });

    it('matches catch-all wildcard *', () => {
      expect(matchesPattern('*', 'anything')).toBe(true);
    });

    it('matches prefix wildcard ext:*', () => {
      expect(matchesPattern('ext:*', 'ext:anything')).toBe(true);
      expect(matchesPattern('ext:*', 'system:foo')).toBe(false);
    });

    it('matches nested prefix ext:atlassian:*', () => {
      expect(matchesPattern('ext:atlassian:*', 'ext:atlassian:ticket-created')).toBe(true);
      expect(matchesPattern('ext:atlassian:*', 'ext:github:push')).toBe(false);
    });
  });
});
