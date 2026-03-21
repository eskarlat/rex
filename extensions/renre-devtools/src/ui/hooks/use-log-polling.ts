import { useState, useEffect, useCallback } from 'react';

import type { PanelSdk, ConsoleEntry, NetworkEntry } from '../shared/types.js';

export function useLogPolling(
  sdk: PanelSdk,
  isRunning: boolean,
  paused: boolean,
  levelFilter: string | null,
  methodFilter: string | null
) {
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [networkEntries, setNetworkEntries] = useState<NetworkEntry[]>([]);
  const [consoleTotalLines, setConsoleTotalLines] = useState(0);
  const [networkTotalLines, setNetworkTotalLines] = useState(0);

  useEffect(() => {
    if (!isRunning || paused) return;
    const poll = (): void => {
      void sdk.exec.run('renre-devtools:console', { format: 'json', limit: 200, ...(levelFilter ? { level: levelFilter } : {}) })
        .then((r) => {
          const d = JSON.parse(r.output) as { entries: ConsoleEntry[]; total: number };
          setConsoleEntries(d.entries);
          setConsoleTotalLines(d.total);
        })
        .catch(() => { /* ignore */ });
    };
    poll();
    const timer = setInterval(poll, 2000);
    return () => { clearInterval(timer); };
  }, [sdk, isRunning, paused, levelFilter]);

  useEffect(() => {
    if (!isRunning || paused) return;
    const poll = (): void => {
      void sdk.exec.run('renre-devtools:network', { format: 'json', limit: 200, ...(methodFilter ? { method: methodFilter } : {}) })
        .then((r) => {
          const d = JSON.parse(r.output) as { entries: NetworkEntry[]; total: number };
          setNetworkEntries(d.entries);
          setNetworkTotalLines(d.total);
        })
        .catch(() => { /* ignore */ });
    };
    poll();
    const timer = setInterval(poll, 2000);
    return () => { clearInterval(timer); };
  }, [sdk, isRunning, paused, methodFilter]);

  const clear = useCallback(() => {
    setConsoleEntries([]);
    setNetworkEntries([]);
    setConsoleTotalLines(0);
    setNetworkTotalLines(0);
  }, []);

  return { consoleEntries, networkEntries, consoleTotalLines, networkTotalLines, clear };
}
