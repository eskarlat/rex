import { useEffect, useRef } from 'react';
import { useNotifications } from '@/core/hooks/use-notifications';

/**
 * Self-contained hook — zero props.
 *
 * - Requests browser Notification permission on mount (once).
 * - Reads from the shared React Query cache via useNotifications()
 *   (no extra HTTP requests — same query key deduplicates).
 * - Tracks a single `lastSeenId` ref. First data load seeds it
 *   (no flood on page open). Subsequent polls fire a browser
 *   Notification for each unread item with id > lastSeenId.
 */
export function useBrowserNotifications(): void {
  const lastSeenId = useRef<number | null>(null);
  const { data: notifications } = useNotifications();

  // Request permission once on mount
  useEffect(() => {
    if (typeof globalThis.Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  // Detect new notifications and fire browser alerts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const maxId = notifications[0]!.id; // newest first (ORDER BY created_at DESC)

    // First load — seed without firing
    if (lastSeenId.current === null) {
      lastSeenId.current = maxId;
      return;
    }

    if (typeof globalThis.Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    for (const n of notifications) {
      if (n.id <= lastSeenId.current) break; // sorted desc — no need to check older
      if (n.read === 1) continue;

      new Notification(n.title, {
        body: n.message || undefined,
        tag: `renre-kit-notification-${n.id}`,
      });
    }

    lastSeenId.current = maxId;
  }, [notifications]);
}
