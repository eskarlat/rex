import { useState, useEffect, useRef, useCallback } from 'react';

export interface ErrorEntry {
  message: string;
  stack: string;
  timestamp: string;
}

interface SdkExec {
  run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }>;
}

const POLL_INTERVAL = 2000;

export function useErrors(sdk: { exec: SdkExec } | undefined, extensionName: string, active: boolean) {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const poll = useCallback(async () => {
    if (!sdk) return;
    try {
      const result = await sdk.exec.run(`${extensionName}:errors`);
      const parsed = JSON.parse(result.output) as unknown;
      if (Array.isArray(parsed)) {
        setErrors(
          parsed.map((entry: Record<string, unknown>) => ({
            message: String(entry['message'] ?? ''),
            stack: String(entry['stack'] ?? ''),
            timestamp: String(entry['timestamp'] ?? new Date().toISOString()),
          })),
        );
      }
    } catch {
      // Silently ignore
    }
  }, [sdk, extensionName]);

  const clear = useCallback(async () => {
    if (!sdk) return;
    try {
      await sdk.exec.run(`${extensionName}:errors`, { clear: true });
      setErrors([]);
    } catch {
      // Silently ignore
    }
  }, [sdk, extensionName]);

  useEffect(() => {
    if (!active) return;
    void poll();
    intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [active, poll]);

  return { errors, clear };
}
