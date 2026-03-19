import { useCallback, useEffect, useRef, useState } from 'react';

export interface LogMessage {
  level: string;
  msg: string;
  time: string;
  source?: string;
  data?: Record<string, unknown>;
}

export interface ConsoleMessage {
  level: string;
  msg: string;
  time: string;
}

interface SocketStreamResult<T> {
  messages: T[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clear: () => void;
  setInitial: (entries: T[]) => void;
}

function useSocketStream<T>(wsPath: string): SocketStreamResult<T> {
  const [messages, setMessages] = useState<T[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}${wsPath}`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as T;
        setMessages((prev) => [...prev.slice(-999), data]);
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
  }, [wsPath]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const setInitial = useCallback((entries: T[]) => {
    setMessages(entries.slice(-1000));
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { messages, connected, connect, disconnect, clear, setInitial };
}

export function useLogSocket(): SocketStreamResult<LogMessage> {
  return useSocketStream<LogMessage>('/api/logs');
}

export function useConsoleSocket(): SocketStreamResult<ConsoleMessage> {
  return useSocketStream<ConsoleMessage>('/api/logs/console');
}
