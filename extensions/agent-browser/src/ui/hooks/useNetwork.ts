import { useState, useEffect, useRef, useCallback } from 'react';

export interface NetworkEntry {
  method: string;
  url: string;
  status: number;
  duration: number;
  size: number;
}

interface SdkExec {
  run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }>;
}

const POLL_INTERVAL = 2000;

export function useNetwork(sdk: { exec: SdkExec } | undefined, extensionName: string, active: boolean) {
  const [requests, setRequests] = useState<NetworkEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const poll = useCallback(async () => {
    if (!sdk) return;
    try {
      const result = await sdk.exec.run(`${extensionName}:network`);
      const parsed = JSON.parse(result.output) as unknown;
      if (Array.isArray(parsed)) {
        setRequests(
          parsed.map((entry: Record<string, unknown>) => ({
            method: String(entry['method'] ?? 'GET'),
            url: String(entry['url'] ?? ''),
            status: Number(entry['status'] ?? 0),
            duration: Number(entry['duration'] ?? 0),
            size: Number(entry['size'] ?? 0),
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
      await sdk.exec.run(`${extensionName}:network`, { clear: true });
      setRequests([]);
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

  return { requests, clear };
}
