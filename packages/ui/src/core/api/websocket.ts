import { useCallback, useEffect, useRef, useState } from 'react';

export interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface LogSocketResult {
  messages: LogMessage[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useLogSocket(): LogSocketResult {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/logs`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as LogMessage;
        setMessages((prev) => [...prev.slice(-499), data]);
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { messages, connected, connect, disconnect };
}
