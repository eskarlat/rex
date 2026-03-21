import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import BetterSqlite3 from 'better-sqlite3';
import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {
  createNotification,
  listNotifications,
  countUnread,
  markRead,
  markAllRead,
  deleteNotification,
  cleanupNotifications,
} from './notification-manager.js';

function applyMigrations(db: Database.Database): void {
  const migrationsDir = path.resolve(import.meta.dirname, '..', '..', '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }
}

describe('notification-manager', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new BetterSqlite3(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    applyMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('createNotification', () => {
    it('inserts and returns record with auto-increment id and defaults variant to info', () => {
      const result = createNotification(db, {
        extension_name: 'ext:hello',
        title: 'Test title',
        message: 'Test message',
      });

      expect(result.id).toBe(1);
      expect(result.extension_name).toBe('ext:hello');
      expect(result.title).toBe('Test title');
      expect(result.message).toBe('Test message');
      expect(result.variant).toBe('info');
      expect(result.action_url).toBeNull();
      expect(result.read).toBe(0);
      expect(result.created_at).toBeTruthy();
    });

    it('creates with all fields populated correctly', () => {
      const result = createNotification(db, {
        extension_name: 'ext:atlassian',
        title: 'Ticket created',
        message: 'PROJ-123 was created',
        variant: 'success',
        action_url: '/extensions/atlassian',
      });

      expect(result.variant).toBe('success');
      expect(result.action_url).toBe('/extensions/atlassian');
    });
  });

  describe('listNotifications', () => {
    it('returns newest first by default', () => {
      createNotification(db, {
        extension_name: 'ext:a',
        title: 'First',
        message: 'msg',
      });
      // Ensure different timestamps
      createNotification(db, {
        extension_name: 'ext:b',
        title: 'Second',
        message: 'msg',
      });

      const list = listNotifications(db);
      expect(list.length).toBe(2);
      expect(list[0]!.title).toBe('Second');
      expect(list[1]!.title).toBe('First');
    });

    it('filters with unreadOnly: true', () => {
      const n = createNotification(db, {
        extension_name: 'ext:a',
        title: 'Read',
        message: 'msg',
      });
      markRead(db, n.id);
      createNotification(db, {
        extension_name: 'ext:b',
        title: 'Unread',
        message: 'msg',
      });

      const list = listNotifications(db, { unreadOnly: true });
      expect(list.length).toBe(1);
      expect(list[0]!.title).toBe('Unread');
    });

    it('caps results with limit', () => {
      for (let i = 0; i < 5; i++) {
        createNotification(db, {
          extension_name: 'ext:a',
          title: `N${i}`,
          message: 'msg',
        });
      }

      const list = listNotifications(db, { limit: 3 });
      expect(list.length).toBe(3);
    });
  });

  describe('countUnread', () => {
    it('counts read=0 rows', () => {
      createNotification(db, { extension_name: 'ext:a', title: 'A', message: 'msg' });
      createNotification(db, { extension_name: 'ext:b', title: 'B', message: 'msg' });
      const n3 = createNotification(db, {
        extension_name: 'ext:c',
        title: 'C',
        message: 'msg',
      });
      markRead(db, n3.id);

      expect(countUnread(db)).toBe(2);
    });
  });

  describe('markRead', () => {
    it('sets read=1 and returns true', () => {
      const n = createNotification(db, {
        extension_name: 'ext:a',
        title: 'A',
        message: 'msg',
      });

      const result = markRead(db, n.id);
      expect(result).toBe(true);

      const list = listNotifications(db);
      expect(list[0]!.read).toBe(1);
    });

    it('returns false for missing id', () => {
      expect(markRead(db, 999)).toBe(false);
    });
  });

  describe('markAllRead', () => {
    it('updates all unread and returns count', () => {
      createNotification(db, { extension_name: 'ext:a', title: 'A', message: 'msg' });
      createNotification(db, { extension_name: 'ext:b', title: 'B', message: 'msg' });

      const count = markAllRead(db);
      expect(count).toBe(2);
      expect(countUnread(db)).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('removes and returns true', () => {
      const n = createNotification(db, {
        extension_name: 'ext:a',
        title: 'A',
        message: 'msg',
      });

      expect(deleteNotification(db, n.id)).toBe(true);
      expect(listNotifications(db).length).toBe(0);
    });

    it('returns false for missing id', () => {
      expect(deleteNotification(db, 999)).toBe(false);
    });
  });

  describe('cleanupNotifications', () => {
    it('removes old read entries', () => {
      // Insert a read notification with old timestamp directly
      db.prepare(
        'INSERT INTO notifications (extension_name, title, message, variant, read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run('ext:old', 'Old', 'msg', 'info', 1, '2020-01-01T00:00:00.000Z');

      createNotification(db, { extension_name: 'ext:new', title: 'New', message: 'msg' });

      const removed = cleanupNotifications(db);
      expect(removed).toBeGreaterThanOrEqual(1);
      expect(listNotifications(db).length).toBe(1);
    });

    it('enforces 1000 cap by removing oldest entries', () => {
      // Insert 1005 notifications directly for speed
      const stmt = db.prepare(
        'INSERT INTO notifications (extension_name, title, message, variant, read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      );
      const insertMany = db.transaction(() => {
        for (let i = 0; i < 1005; i++) {
          stmt.run('ext:test', `N${i}`, 'msg', 'info', 0, new Date(2025, 0, 1, 0, 0, i).toISOString());
        }
      });
      insertMany();

      const removed = cleanupNotifications(db);
      expect(removed).toBeGreaterThanOrEqual(5);

      const remaining = listNotifications(db, { limit: 2000 });
      expect(remaining.length).toBeLessThanOrEqual(1000);
    });
  });
});
