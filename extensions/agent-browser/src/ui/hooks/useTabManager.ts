import { useState, useEffect, useCallback } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';

export interface BrowserTab {
  targetId: string;
  url: string;
  title: string;
  type: string;
}

function mapTarget(info: Record<string, unknown>): BrowserTab {
  return {
    targetId: typeof info['targetId'] === 'string' ? info['targetId'] : '',
    url: typeof info['url'] === 'string' ? info['url'] : '',
    title: typeof info['title'] === 'string' ? info['title'] : '',
    type: typeof info['type'] === 'string' ? info['type'] : '',
  };
}

function handleCreated(params: Record<string, unknown>, setTabs: React.Dispatch<React.SetStateAction<BrowserTab[]>>): void {
  const info = params['targetInfo'] as Record<string, unknown> | undefined;
  if (info && info['type'] === 'page') {
    setTabs((prev) => [...prev, mapTarget(info)]);
  }
}

function handleDestroyed(
  params: Record<string, unknown>,
  setTabs: React.Dispatch<React.SetStateAction<BrowserTab[]>>,
  setActiveTabId: React.Dispatch<React.SetStateAction<string | null>>,
): void {
  const targetId = params['targetId'] as string;
  setTabs((prev) => prev.filter((t) => t.targetId !== targetId));
  setActiveTabId((prev) => (prev === targetId ? null : prev));
}

function handleChanged(params: Record<string, unknown>, setTabs: React.Dispatch<React.SetStateAction<BrowserTab[]>>): void {
  const info = params['targetInfo'] as Record<string, unknown> | undefined;
  if (info && info['type'] === 'page') {
    setTabs((prev) =>
      prev.map((t) => (t.targetId === info['targetId'] ? mapTarget(info) : t)),
    );
  }
}

export function useTabManager(client: CdpClient | null) {
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const fetchInitialTabs = useCallback(
    (cdpClient: CdpClient) => {
      void cdpClient.send('Target.getTargets').then((result) => {
        const targetInfos = (result as { targetInfos?: unknown[] })?.targetInfos;
        if (Array.isArray(targetInfos)) {
          const pageTabs = targetInfos
            .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
            .filter((t) => t['type'] === 'page')
            .map(mapTarget);
          setTabs(pageTabs);
          if (pageTabs.length > 0) {
            setActiveTabId((prev) => prev ?? pageTabs[0]?.targetId ?? null);
          }
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (!client?.connected) {
      setTabs([]);
      setActiveTabId(null);
      return;
    }

    fetchInitialTabs(client);

    const unsubCreated = client.on('Target.targetCreated', (params) => handleCreated(params, setTabs));
    const unsubDestroyed = client.on('Target.targetDestroyed', (params) => handleDestroyed(params, setTabs, setActiveTabId));
    const unsubChanged = client.on('Target.targetInfoChanged', (params) => handleChanged(params, setTabs));

    void client.send('Target.setDiscoverTargets', { discover: true });

    return () => {
      unsubCreated();
      unsubDestroyed();
      unsubChanged();
    };
  }, [client, client?.connected, fetchInitialTabs]);

  return { tabs, activeTabId, setActiveTabId };
}
