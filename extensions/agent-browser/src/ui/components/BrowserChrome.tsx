import { useState, useCallback } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';
import type { BrowserTab } from '../hooks/useTabManager.js';
import type { ConsoleEntry } from '../hooks/useConsole.js';
import type { NetworkEntry } from '../hooks/useNetwork.js';
import type { ErrorEntry } from '../hooks/useErrors.js';
import type { SelectedElement } from '../hooks/useDevMode.js';

import { TabBar } from './TabBar.js';
import { AddressBar } from './AddressBar.js';
import { Viewport } from './Viewport.js';
import { DevToolsOverlay } from './DevToolsOverlay.js';
import { DebugDrawer } from './DebugDrawer.js';

interface BrowserChromeProps {
  client: CdpClient | null;
  url: string | null;
  tabs: BrowserTab[];
  activeTabId: string | null;
  devMode: boolean;
  selectedElement: SelectedElement | null;
  logs: ConsoleEntry[];
  requests: NetworkEntry[];
  errors: ErrorEntry[];
  viewport: { width: number; height: number };
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onDevModeToggle: () => void;
  onClearSelection: () => void;
  onClearConsole: () => void;
  onClearNetwork: () => void;
  onClearErrors: () => void;
}

export function BrowserChrome({
  client,
  url,
  tabs,
  activeTabId,
  devMode,
  selectedElement,
  logs,
  requests,
  errors,
  viewport,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onTabSelect,
  onTabClose,
  onNewTab,
  onDevModeToggle,
  onClearSelection,
  onClearConsole,
  onClearNetwork,
  onClearErrors,
}: Readonly<BrowserChromeProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDevModeToggle = useCallback(() => {
    onDevModeToggle();
    if (!devMode) setDrawerOpen(true);
  }, [devMode, onDevModeToggle]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden bg-background">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      <AddressBar
        url={url}
        onNavigate={onNavigate}
        onBack={onBack}
        onForward={onForward}
        onReload={onReload}
        devMode={devMode}
        onDevModeToggle={handleDevModeToggle}
      />
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <Viewport client={client} viewport={viewport} />
        <DevToolsOverlay element={selectedElement} onClose={onClearSelection} />
        {devMode && drawerOpen && (
          <DebugDrawer
            logs={logs}
            requests={requests}
            errors={errors}
            selectedElement={selectedElement}
            onClearConsole={onClearConsole}
            onClearNetwork={onClearNetwork}
            onClearErrors={onClearErrors}
            onClose={handleDrawerClose}
          />
        )}
      </div>
    </div>
  );
}
