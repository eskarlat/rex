import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const INITIAL_RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface EventMessage {
  action: string;
  event?: {
    type: string;
    source: string;
    data: Record<string, unknown>;
    timestamp: string;
  };
}

/**
 * Connects to the `/api/events` WebSocket and subscribes to
 * `system:notification:*`. When a notification event arrives,
 * invalidates the React Query notification cache so all
 * consumers (`useNotifications`, `useUnreadCount`,
 * `useBrowserNotifications`) update instantly.
 *
 * Automatically reconnects on unexpected close.
 */
export function useNotificationSocket(): void {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    unmounted.current = false;
    reconnectAttempts.current = 0;

    function connect(): void {
      if (unmounted.current) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/events`);

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        ws.send(JSON.stringify({ action: 'subscribe', patterns: ['system:notification:*'] }));
      };

      ws.onmessage = (event: MessageEvent) => {
        let msg: EventMessage;
        try {
          msg = JSON.parse(String(event.data)) as EventMessage;
        } catch {
          return;
        }

        if (msg.action === 'event' && msg.event) {
          void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!unmounted.current && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current),
            MAX_RECONNECT_DELAY_MS,
          );
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);
}
