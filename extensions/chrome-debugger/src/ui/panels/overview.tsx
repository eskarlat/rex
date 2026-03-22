import { BrowserControlsCard } from '../components/BrowserControlsCard.js';
import { ChromeAlert } from '../components/ChromeAlert.js';
import { InspectedElement } from '../components/InspectedElement.js';
import { InstallDialog } from '../components/InstallDialog.js';
import { NavigateCard } from '../components/NavigateCard.js';
import { TabsCard } from '../components/TabsCard.js';
import { useBrowserActions } from '../hooks/use-browser-actions.js';
import { useBrowserStatus } from '../hooks/use-browser-status.js';
import { useChromeDetection } from '../hooks/use-chrome-detection.js';
import { useHeartbeat } from '../hooks/use-heartbeat.js';
import { useInspect } from '../hooks/use-inspect.js';
import { useRunAction } from '../hooks/use-run-action.js';
import type { PanelProps, PanelSdk, TabInfo } from '../shared/types.js';

interface DerivedStatus {
  isRunning: boolean;
  isExternal: boolean;
  tabs: TabInfo[];
  chromeNotFound: boolean;
  cdpDetected: boolean;
}

function deriveStatus(statusData: Record<string, unknown> | null, chromeCheck: Record<string, unknown> | null): DerivedStatus {
  return {
    isRunning: statusData?.running === true,
    isExternal: statusData?.external === true,
    tabs: (statusData?.tabs as TabInfo[] | undefined) ?? [],
    chromeNotFound: chromeCheck?.found === false,
    cdpDetected: chromeCheck?.cdpRunning === true,
  };
}

function OverviewContent({ sdk }: Readonly<{ sdk: PanelSdk }>) {
  const { data: statusData, loading: statusLoading, refresh: refreshStatus } = useBrowserStatus(sdk);
  const { actionLoading, runAction } = useRunAction(sdk, refreshStatus);
  const actions = useBrowserActions(sdk, runAction);
  const { chromeCheck, installDialogOpen, setInstallDialogOpen, installing, handleInstall } = useChromeDetection(sdk);
  const { inspecting, selectedElement, handleInspect } = useInspect(sdk);

  const status = deriveStatus(statusData, chromeCheck);
  useHeartbeat(sdk, status.isRunning && !status.isExternal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {status.chromeNotFound ? <ChromeAlert chromeCheck={chromeCheck} onInstallClick={() => setInstallDialogOpen(true)} /> : null}

      <BrowserControlsCard
        isRunning={status.isRunning} isExternal={status.isExternal} statusData={statusData} statusLoading={statusLoading}
        chromeDisabled={status.chromeNotFound && !status.cdpDetected} actionLoading={actionLoading} inspecting={inspecting}
        cdpDetected={status.cdpDetected}
        onLaunch={actions.handleLaunch} onClose={actions.handleClose}
        onScreenshot={actions.handleScreenshot} onInspect={handleInspect}
        onConnect={actions.handleConnect}
      />

      {status.isRunning ? <NavigateCard onNavigate={actions.handleNavigate} actionLoading={actionLoading} /> : null}
      {status.isRunning && status.tabs.length > 0 ? <TabsCard tabs={status.tabs} onSwitchTab={actions.handleSwitchTab} /> : null}
      {selectedElement ? <InspectedElement output={selectedElement} /> : null}

      <InstallDialog open={installDialogOpen} installing={installing}
        onClose={() => setInstallDialogOpen(false)} onInstall={handleInstall} />
    </div>
  );
}

export default function OverviewPanel({ sdk }: Partial<PanelProps>) {
  if (!sdk) return <div style={{ padding: '16px' }}>SDK not available</div>;
  return <OverviewContent sdk={sdk} />;
}
