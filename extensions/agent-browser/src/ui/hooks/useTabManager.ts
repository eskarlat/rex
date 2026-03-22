import { useState, useEffect } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';

export interface BrowserTab {
  targetId: string;
  url: string;
  title: string;
  type: string;
}

export function useTabManager(client: CdpClient | null) {
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (!client?.connected) {
      setTabs([]);
      setActiveTabId(null);
      return;
    }

    // Fetch initial targets
    void client.send('Target.getTargets').then((result) => {
      const targetInfos = (result as { targetInfos?: unknown[] })?.targetInfos;
      if (Array.isArray(targetInfos)) {
        const pageTabs = targetInfos
          .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
          .filter((t) => t['type'] === 'page')
          .map(mapTarget);
        setTabs(pageTabs);
        if (pageTabs.length > 0 && !activeTabId) {
          setActiveTabId(pageTabs[0]?.targetId ?? null);
        }
      }
    });

    const unsubCreated = client.on('Target.targetCreated', (params) => {
      const info = params['targetInfo'] as Record<string, unknown> | undefined;
      if (info && info['type'] === 'page') {
        setTabs((prev) => [...prev, mapTarget(info)]);
      }
    });

    const unsubDestroyed = client.on('Target.targetDestroyed', (params) => {
      const targetId = params['targetId'] as string;
      setTabs((prev) => prev.filter((t) => t.targetId !== targetId));
      setActiveTabId((prev) => (prev === targetId ? null : prev));
    });

    const unsubChanged = client.on('Target.targetInfoChanged', (params) => {
      const info = params['targetInfo'] as Record<string, unknown> | undefined;
      if (info && info['type'] === 'page') {
        setTabs((prev) =>
          prev.map((t) => (t.targetId === info['targetId'] ? mapTarget(info) : t)),
        );
      }
    });

    void client.send('Target.setDiscoverTargets', { discover: true });

    return () => {
      unsubCreated();
      unsubDestroyed();
      unsubChanged();
    };
  }, [client, client?.connected]);

  return { tabs, activeTabId, setActiveTabId };
}

function mapTarget(info: Record<string, unknown>): BrowserTab {
  return {
    targetId: String(info['targetId'] ?? ''),
    url: String(info['url'] ?? ''),
    title: String(info['title'] ?? ''),
    type: String(info['type'] ?? ''),
  };
}
