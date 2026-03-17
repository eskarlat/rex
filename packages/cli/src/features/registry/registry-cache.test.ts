import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isStale, updateTimestamp, getLastFetched } from './registry-cache.js';

describe('registry-cache', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renre-cache-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('getLastFetched', () => {
    it('returns null when .fetched_at does not exist', () => {
      expect(getLastFetched(tmpDir)).toBeNull();
    });

    it('returns a Date when .fetched_at exists', () => {
      const now = new Date();
      fs.writeFileSync(path.join(tmpDir, '.fetched_at'), now.toISOString());
      const result = getLastFetched(tmpDir);
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe(now.toISOString());
    });

    it('returns null for invalid timestamp', () => {
      fs.writeFileSync(path.join(tmpDir, '.fetched_at'), 'not-a-date');
      expect(getLastFetched(tmpDir)).toBeNull();
    });
  });

  describe('updateTimestamp', () => {
    it('creates .fetched_at file with ISO timestamp', () => {
      updateTimestamp(tmpDir);
      const content = fs.readFileSync(
        path.join(tmpDir, '.fetched_at'),
        'utf-8',
      );
      const date = new Date(content);
      expect(date.getTime()).not.toBeNaN();
      // Should be within last second
      expect(Date.now() - date.getTime()).toBeLessThan(1000);
    });

    it('overwrites existing .fetched_at file', () => {
      const old = new Date('2020-01-01').toISOString();
      fs.writeFileSync(path.join(tmpDir, '.fetched_at'), old);
      updateTimestamp(tmpDir);
      const content = fs.readFileSync(
        path.join(tmpDir, '.fetched_at'),
        'utf-8',
      );
      expect(content).not.toBe(old);
    });
  });

  describe('isStale', () => {
    it('returns true when .fetched_at does not exist', () => {
      expect(isStale(tmpDir, 3600)).toBe(true);
    });

    it('returns true when cache is older than TTL', () => {
      const oldDate = new Date(Date.now() - 7200 * 1000); // 2 hours ago
      fs.writeFileSync(
        path.join(tmpDir, '.fetched_at'),
        oldDate.toISOString(),
      );
      expect(isStale(tmpDir, 3600)).toBe(true); // TTL = 1 hour
    });

    it('returns false when cache is fresher than TTL', () => {
      const recentDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
      fs.writeFileSync(
        path.join(tmpDir, '.fetched_at'),
        recentDate.toISOString(),
      );
      expect(isStale(tmpDir, 3600)).toBe(false); // TTL = 1 hour
    });

    it('cacheTTL 0 means always stale (always fetch)', () => {
      updateTimestamp(tmpDir);
      expect(isStale(tmpDir, 0)).toBe(true);
    });

    it('cacheTTL -1 means never stale (manual only)', () => {
      // Even without .fetched_at, -1 means manual only => never stale
      expect(isStale(tmpDir, -1)).toBe(false);
    });

    it('cacheTTL -1 is never stale even with old timestamp', () => {
      const oldDate = new Date('2020-01-01');
      fs.writeFileSync(
        path.join(tmpDir, '.fetched_at'),
        oldDate.toISOString(),
      );
      expect(isStale(tmpDir, -1)).toBe(false);
    });
  });
});
