import { useEffect, useCallback } from 'react';
import { fetchApi } from '@/core/api/client';

interface StreamControls<T> {
  messages: T[];
  connected: boolean;
  clear: () => void;
  connect: () => void;
  disconnect: () => void;
  setInitial: (entries: T[]) => void;
}

export type { StreamControls };

export function useAutoScroll(
  scrollRef: React.RefObject<HTMLElement | null>,
  depLength: number,
  enabled: boolean,
): void {
  useEffect(() => {
    if (enabled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [enabled, scrollRef, depLength]);
}

export function useStreamLifecycle<T>(
  stream: StreamControls<T>,
  initialUrl: string,
): void {
  const { connect, disconnect, setInitial } = stream;

  useEffect(() => {
    fetchApi<T[]>(initialUrl)
      .then((entries) => {
        setInitial(entries);
      })
      .catch(() => {})
      .finally(() => {
        connect();
      });
    return () => disconnect();
  }, [connect, disconnect, setInitial, initialUrl]);
}

export function useScrollToBottom(
  scrollRef: React.RefObject<HTMLElement | null>,
): () => void {
  return useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef]);
}
