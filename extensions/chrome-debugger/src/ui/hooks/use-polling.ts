import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling<T>(
  fn: () => Promise<T>,
  intervalMs: number,
  enabled: boolean
): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const refresh = useCallback(() => {
    setLoading(true);
    fnRef
      .current()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(refresh, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [enabled, intervalMs, refresh]);

  return { data, loading, error, refresh };
}
