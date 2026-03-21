import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const RECONNECT_DELAY_MS = 3000;

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

  useEffect(() => {
    unmounted.current = false;

    function connect(): void {
      if (unmounted.current) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/events`);

      ws.onopen = () => {
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
        if (!unmounted.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
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
