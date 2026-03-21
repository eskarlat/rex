import type Database from 'better-sqlite3';
import type { NotificationRecord, CreateNotificationPayload } from './notification.types.js';

const DEFAULT_LIMIT = 50;
const MAX_NOTIFICATIONS = 1000;
const CLEANUP_AGE_DAYS = 30;

export interface ListNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
}

export function createNotification(
  db: Database.Database,
  payload: CreateNotificationPayload,
): NotificationRecord {
  const now = new Date().toISOString();
  const variant = payload.variant ?? 'info';
  const actionUrl = payload.action_url ?? null;

  const stmt = db.prepare(
    'INSERT INTO notifications (extension_name, title, message, variant, action_url, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
  );
  const result = stmt.run(
    payload.extension_name,
    payload.title,
    payload.message,
    variant,
    actionUrl,
    now,
  );

  return {
    id: Number(result.lastInsertRowid),
    extension_name: payload.extension_name,
    title: payload.title,
    message: payload.message,
    variant,
    action_url: actionUrl,
    read: 0,
    created_at: now,
  };
}

export function listNotifications(
  db: Database.Database,
  options?: ListNotificationsOptions,
): NotificationRecord[] {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const unreadOnly = options?.unreadOnly ?? false;

  if (unreadOnly) {
    return db
      .prepare('SELECT * FROM notifications WHERE read = 0 ORDER BY created_at DESC LIMIT ?')
      .all(limit) as NotificationRecord[];
  }

  return db
    .prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?')
    .all(limit) as NotificationRecord[];
}

export function countUnread(db: Database.Database): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE read = 0').get() as {
    count: number;
  };
  return row.count;
}

export function markRead(db: Database.Database, id: number): boolean {
  const result = db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  return result.changes > 0;
}

export function markAllRead(db: Database.Database): number {
  const result = db.prepare('UPDATE notifications SET read = 1 WHERE read = 0').run();
  return result.changes;
}

export function deleteNotification(db: Database.Database, id: number): boolean {
  const result = db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  return result.changes > 0;
}

export function cleanupNotifications(db: Database.Database): number {
  let totalRemoved = 0;

  // Remove read notifications older than 30 days
  const cutoff = new Date(Date.now() - CLEANUP_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const ageResult = db
    .prepare('DELETE FROM notifications WHERE read = 1 AND created_at < ?')
    .run(cutoff);
  totalRemoved += ageResult.changes;

  // Enforce 1000 cap — delete oldest entries beyond the cap
  const countRow = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as {
    count: number;
  };
  if (countRow.count > MAX_NOTIFICATIONS) {
    const excess = countRow.count - MAX_NOTIFICATIONS;
    const capResult = db
      .prepare(
        'DELETE FROM notifications WHERE id IN (SELECT id FROM notifications ORDER BY created_at ASC LIMIT ?)',
      )
      .run(excess);
    totalRemoved += capResult.changes;
  }

  return totalRemoved;
}
