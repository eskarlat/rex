import { useState, useEffect, useRef, useCallback } from 'react';

export interface BrowserStatus {
  connected: boolean;
  cdpUrl: string | null;
  url: string | null;
  title: string | null;
}

const POLL_INTERVAL = 3000;

const EMPTY_STATUS: BrowserStatus = {
  connected: false,
  cdpUrl: null,
  url: null,
  title: null,
};

interface SdkExec {
  run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }>;
}

export function useBrowserStatus(sdk: { exec: SdkExec } | undefined, extensionName: string) {
  const [status, setStatus] = useState<BrowserStatus>(EMPTY_STATUS);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const poll = useCallback(async () => {
    if (!sdk) return;
    try {
      setLoading(true);
      const result = await sdk.exec.run(`${extensionName}:status`);
      const parsed = JSON.parse(result.output) as Record<string, unknown>;
      setStatus({
        connected: Boolean(parsed['connected'] ?? parsed['cdpUrl']),
        cdpUrl: typeof parsed['cdpUrl'] === 'string' ? parsed['cdpUrl'] : null,
        url: typeof parsed['url'] === 'string' ? parsed['url'] : null,
        title: typeof parsed['title'] === 'string' ? parsed['title'] : null,
      });
    } catch {
      setStatus(EMPTY_STATUS);
    } finally {
      setLoading(false);
    }
  }, [sdk, extensionName]);

  useEffect(() => {
    void poll();
    intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  return { status, loading, refresh: poll };
}
