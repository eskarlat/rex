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

function OverviewContent({ sdk }: Readonly<{ sdk: PanelSdk }>) {
  const { data: statusData, loading: statusLoading, refresh: refreshStatus } = useBrowserStatus(sdk);
  const isRunning = statusData?.running === true;
  const isExternal = statusData?.external === true;
  const tabs: TabInfo[] = statusData?.tabs ?? [];

  const { actionLoading, runAction } = useRunAction(sdk, refreshStatus);
  const actions = useBrowserActions(sdk, runAction);
  const { chromeCheck, installDialogOpen, setInstallDialogOpen, installing, handleInstall } = useChromeDetection(sdk);
  const { inspecting, selectedElement, handleInspect } = useInspect(sdk);

  useHeartbeat(sdk, isRunning && !isExternal);

  const chromeNotFound = chromeCheck?.found === false;
  const cdpDetected = chromeCheck?.cdpRunning === true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {chromeNotFound ? <ChromeAlert chromeCheck={chromeCheck} onInstallClick={() => setInstallDialogOpen(true)} /> : null}

      <BrowserControlsCard
        isRunning={isRunning} isExternal={isExternal} statusData={statusData} statusLoading={statusLoading}
        chromeDisabled={chromeNotFound && !cdpDetected} actionLoading={actionLoading} inspecting={inspecting}
        cdpDetected={cdpDetected}
        onLaunch={actions.handleLaunch} onClose={actions.handleClose}
        onScreenshot={actions.handleScreenshot} onInspect={handleInspect}
        onConnect={actions.handleConnect}
      />

      {isRunning ? <NavigateCard onNavigate={actions.handleNavigate} actionLoading={actionLoading} /> : null}
      {isRunning && tabs.length > 0 ? <TabsCard tabs={tabs} onSwitchTab={actions.handleSwitchTab} /> : null}
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
