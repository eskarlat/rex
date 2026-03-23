import { useState, useCallback } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

import { useBrowserStatus } from './hooks/useBrowserStatus.js';
import { useCdpConnection } from './hooks/useCdpConnection.js';
import { useTabManager } from './hooks/useTabManager.js';
import { useDevMode } from './hooks/useDevMode.js';
import { useConsole } from './hooks/useConsole.js';
import { useNetwork } from './hooks/useNetwork.js';
import { useErrors } from './hooks/useErrors.js';
import { BrowserEmptyState } from './components/EmptyState.js';
import { BrowserChrome } from './components/BrowserChrome.js';

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

export default function BrowserPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'agent-browser';
  const [launching, setLaunching] = useState(false);

  const { status, refresh } = useBrowserStatus(sdk, extName);
  const { client, connected } = useCdpConnection(status.cdpUrl);
  const { tabs, activeTabId, setActiveTabId } = useTabManager(client);
  const { enabled: devMode, toggle: toggleDevMode, selectedElement, clearSelection } = useDevMode(client);
  const { logs, clear: clearConsole } = useConsole(sdk, extName, devMode);
  const { requests, clear: clearNetwork } = useNetwork(sdk, extName, devMode);
  const { errors, clear: clearErrors } = useErrors(sdk, extName, devMode);

  const handleLaunch = useCallback(
    async (url: string) => {
      if (!sdk) return;
      setLaunching(true);
      try {
        await sdk.exec.run(`${extName}:open`, { url });
        await refresh();
      } catch {
        // Launch failed — status will remain disconnected
      } finally {
        setLaunching(false);
      }
    },
    [sdk, extName, refresh],
  );

  const handleNavigate = useCallback(
    async (url: string) => {
      if (!sdk) return;
      await sdk.exec.run(`${extName}:open`, { url });
      await refresh();
    },
    [sdk, extName, refresh],
  );

  const handleBack = useCallback(async () => {
    if (!sdk) return;
    await sdk.exec.run(`${extName}:back`);
    await refresh();
  }, [sdk, extName, refresh]);

  const handleForward = useCallback(async () => {
    if (!sdk) return;
    await sdk.exec.run(`${extName}:forward`);
    await refresh();
  }, [sdk, extName, refresh]);

  const handleReload = useCallback(async () => {
    if (!sdk) return;
    await sdk.exec.run(`${extName}:reload`);
    await refresh();
  }, [sdk, extName, refresh]);

  const handleNewTab = useCallback(async () => {
    if (!sdk) return;
    await sdk.exec.run(`${extName}:open`, { url: 'about:blank' });
  }, [sdk, extName]);

  const handleTabClose = useCallback(
    async (tabId: string) => {
      if (!client) return;
      await client.send('Target.closeTarget', { targetId: tabId });
    },
    [client],
  );

  if (!status.connected && !connected) {
    return <BrowserEmptyState onLaunch={handleLaunch} loading={launching} />;
  }

  return (
    <BrowserChrome
      client={client}
      url={status.url}
      tabs={tabs}
      activeTabId={activeTabId}
      devMode={devMode}
      selectedElement={selectedElement}
      logs={logs}
      requests={requests}
      errors={errors}
      viewport={DEFAULT_VIEWPORT}
      onNavigate={handleNavigate}
      onBack={handleBack}
      onForward={handleForward}
      onReload={handleReload}
      onTabSelect={setActiveTabId}
      onTabClose={handleTabClose}
      onNewTab={handleNewTab}
      onDevModeToggle={toggleDevMode}
      onClearSelection={clearSelection}
      onClearConsole={clearConsole}
      onClearNetwork={clearNetwork}
      onClearErrors={clearErrors}
    />
  );
}
