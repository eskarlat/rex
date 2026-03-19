import { useCallback, useEffect, useRef, useState } from 'react';

export interface LogMessage {
  level: string;
  msg: string;
  time: string;
  source?: string;
  data?: Record<string, unknown>;
}

interface LogSocketResult {
  messages: LogMessage[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clear: () => void;
  setInitial: (entries: LogMessage[]) => void;
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
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const setInitial = useCallback((entries: LogMessage[]) => {
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

export interface ConsoleMessage {
  level: string;
  msg: string;
  time: string;
}

interface ConsoleSocketResult {
  messages: ConsoleMessage[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clear: () => void;
  setInitial: (entries: ConsoleMessage[]) => void;
}

export function useConsoleSocket(): ConsoleSocketResult {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/logs/console`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as ConsoleMessage;
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
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const setInitial = useCallback((entries: ConsoleMessage[]) => {
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
