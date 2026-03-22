import { useState, useEffect, useRef, useCallback } from 'react';

function extractText(entry: Record<string, unknown>): string {
  if (typeof entry['text'] === 'string') return entry['text'];
  if (typeof entry['message'] === 'string') return entry['message'];
  return '';
}

export interface ConsoleEntry {
  level: string;
  text: string;
  timestamp: string;
}

interface SdkExec {
  run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }>;
}

const POLL_INTERVAL = 2000;

export function useConsole(sdk: { exec: SdkExec } | undefined, extensionName: string, active: boolean) {
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const poll = useCallback(async () => {
    if (!sdk) return;
    try {
      const result = await sdk.exec.run(`${extensionName}:console`);
      const parsed = JSON.parse(result.output) as unknown;
      if (Array.isArray(parsed)) {
        setLogs(
          parsed.map((entry: Record<string, unknown>) => ({
            level: typeof entry['level'] === 'string' ? entry['level'] : 'info',
            text: extractText(entry),
            timestamp: typeof entry['timestamp'] === 'string' ? entry['timestamp'] : new Date().toISOString(),
          })),
        );
      }
    } catch {
      // Silently ignore poll failures
    }
  }, [sdk, extensionName]);

  const clear = useCallback(async () => {
    if (!sdk) return;
    try {
      await sdk.exec.run(`${extensionName}:console`, { clear: true });
      setLogs([]);
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

  return { logs, clear };
}
