import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Spinner,
} from '@renre-kit/extension-sdk/components';

import type { BrowserStatusData } from '../shared/types.js';

function BrowserInfo({ statusData }: Readonly<{ statusData: BrowserStatusData }>) {
  const since = statusData.launchedAt
    ? ` · Since: ${new Date(statusData.launchedAt).toLocaleTimeString()}`
    : '';

  return (
    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted-foreground, #94a3b8)' }}>
      PID: {statusData.pid} · Port: {statusData.port} · Tabs: {statusData.tabCount}{since}
    </div>
  );
}

function BadgeLabel({ statusLoading, isRunning }: Readonly<{ statusLoading: boolean; isRunning: boolean }>): string {
  if (statusLoading) return 'Checking...';
  return isRunning ? 'Running' : 'Stopped';
}

function StoppedButtons({ actionLoading, chromeDisabled, cdpDetected, onLaunch, onConnect }: Readonly<{
  actionLoading: boolean; chromeDisabled: boolean; cdpDetected: boolean;
  onLaunch: () => void; onConnect?: () => void;
}>) {
  return (
    <>
      <Button onClick={onLaunch} disabled={actionLoading || chromeDisabled}>
        {actionLoading ? <Spinner /> : null} Launch Browser
      </Button>
      {cdpDetected && onConnect ? (
        <Button variant="outline" onClick={onConnect} disabled={actionLoading}>
          {actionLoading ? <Spinner /> : null} Connect to Running Browser
        </Button>
      ) : null}
    </>
  );
}

function RunningButtons({ actionLoading, inspecting, isExternal, onClose, onScreenshot, onInspect }: Readonly<{
  actionLoading: boolean; inspecting: boolean; isExternal: boolean;
  onClose: () => void; onScreenshot: () => void; onInspect: () => void;
}>) {
  const inspectLabel = inspecting ? 'Click element...' : 'Inspect';
  return (
    <>
      <Button variant="destructive" onClick={onClose} disabled={actionLoading}>
        {isExternal ? 'Disconnect' : 'Stop Browser'}
      </Button>
      <Button variant="outline" onClick={onScreenshot} disabled={actionLoading}>Screenshot</Button>
      <Button variant="outline" onClick={onInspect} disabled={actionLoading || inspecting}>
        {inspecting ? <Spinner /> : null} {inspectLabel}
      </Button>
    </>
  );
}

interface BrowserControlsCardProps {
  isRunning: boolean;
  isExternal?: boolean;
  statusData: BrowserStatusData | null;
  statusLoading: boolean;
  chromeDisabled: boolean;
  actionLoading: boolean;
  inspecting: boolean;
  cdpDetected?: boolean;
  onLaunch: () => void;
  onClose: () => void;
  onScreenshot: () => void;
  onInspect: () => void;
  onConnect?: () => void;
}

export function BrowserControlsCard({
  isRunning, isExternal, statusData, statusLoading, chromeDisabled,
  actionLoading, inspecting, cdpDetected,
  onLaunch, onClose, onScreenshot, onInspect, onConnect,
}: Readonly<BrowserControlsCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Browser
          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {BadgeLabel({ statusLoading, isRunning })}
          </Badge>
          {isRunning && isExternal ? <Badge variant="outline">External</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isRunning ? (
            <RunningButtons actionLoading={actionLoading} inspecting={inspecting}
              isExternal={isExternal ?? false} onClose={onClose} onScreenshot={onScreenshot} onInspect={onInspect} />
          ) : (
            <StoppedButtons actionLoading={actionLoading} chromeDisabled={chromeDisabled}
              cdpDetected={cdpDetected ?? false} onLaunch={onLaunch} onConnect={onConnect} />
          )}
        </div>
        {isRunning && statusData ? <BrowserInfo statusData={statusData} /> : null}
      </CardContent>
    </Card>
  );
}
