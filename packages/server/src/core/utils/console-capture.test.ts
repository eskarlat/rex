import { describe, it, expect } from 'vitest';
import {
  installConsoleCapture,
  pushConsoleEntry,
  getConsoleEntries,
  subscribeConsole,
} from './console-capture.js';

describe('console-capture', () => {
  describe('pushConsoleEntry', () => {
    it('adds an entry with level, msg, and time', () => {
      pushConsoleEntry('warn', 'warning msg');
      const entries = getConsoleEntries();
      const entry = entries.find((e) => e.msg === 'warning msg');
      expect(entry).toBeDefined();
      expect(entry?.level).toBe('warn');
      expect(entry?.time).toBeDefined();
    });

    it('respects max buffer size', () => {
      for (let i = 0; i < 1005; i++) {
        pushConsoleEntry('info', `overflow-${i}`);
      }
      const entries = getConsoleEntries();
      expect(entries.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('getConsoleEntries', () => {
    it('returns a copy of the buffer', () => {
      pushConsoleEntry('info', 'copy test');
      const entries1 = getConsoleEntries();
      const entries2 = getConsoleEntries();
      expect(entries1).not.toBe(entries2);
    });
  });

  describe('subscribeConsole', () => {
    it('notifies listener on new entries and stops after unsubscribe', () => {
      const received: string[] = [];
      const unsub = subscribeConsole((entry) => {
        received.push(entry.msg);
      });

      pushConsoleEntry('info', 'live msg');
      expect(received).toContain('live msg');

      unsub();
      pushConsoleEntry('info', 'after unsub');
      expect(received).not.toContain('after unsub');
    });

    it('supports multiple listeners', () => {
      const received1: string[] = [];
      const received2: string[] = [];
      const unsub1 = subscribeConsole((e) => received1.push(e.msg));
      const unsub2 = subscribeConsole((e) => received2.push(e.msg));

      pushConsoleEntry('info', 'multi');
      expect(received1).toContain('multi');
      expect(received2).toContain('multi');

      unsub1();
      unsub2();
    });
  });

  describe('installConsoleCapture', () => {
    it('patches all console methods to capture entries', () => {
      // installConsoleCapture is idempotent — safe to call multiple times
      installConsoleCapture();

      // Suppress test output noise by capturing the original patched methods
      const patchedLog = console.log;
      const patchedWarn = console.warn;
      const patchedError = console.error;
      const patchedDebug = console.debug;

      // Override with quiet versions that still call the patched capture logic
      console.log = (...args: unknown[]) => {
        patchedLog(...args);
      };
      console.warn = (...args: unknown[]) => {
        patchedWarn(...args);
      };
      console.error = (...args: unknown[]) => {
        patchedError(...args);
      };
      console.debug = (...args: unknown[]) => {
        patchedDebug(...args);
      };

      // Test all four levels
      patchedLog('captured log');
      patchedWarn('captured warn');
      patchedError('captured error');
      patchedDebug('captured debug');

      // Test non-string arg serialization
      patchedLog('hello', { key: 'val' }, 42);

      const entries = getConsoleEntries();
      expect(entries.some((e) => e.msg === 'captured log' && e.level === 'info')).toBe(true);
      expect(entries.some((e) => e.msg === 'captured warn' && e.level === 'warn')).toBe(true);
      expect(entries.some((e) => e.msg === 'captured error' && e.level === 'error')).toBe(true);
      expect(entries.some((e) => e.msg === 'captured debug' && e.level === 'debug')).toBe(true);

      const joinedEntry = entries.find((e) => e.msg.includes('hello'));
      expect(joinedEntry?.msg).toContain('{"key":"val"}');
      expect(joinedEntry?.msg).toContain('42');

      // Restore
      console.log = patchedLog;
      console.warn = patchedWarn;
      console.error = patchedError;
      console.debug = patchedDebug;
    });
  });
});
