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

interface BrowserControlsCardProps {
  isRunning: boolean;
  statusData: BrowserStatusData | null;
  statusLoading: boolean;
  chromeDisabled: boolean;
  actionLoading: boolean;
  inspecting: boolean;
  onLaunch: () => void;
  onClose: () => void;
  onScreenshot: () => void;
  onInspect: () => void;
}

export function BrowserControlsCard({
  isRunning, statusData, statusLoading, chromeDisabled,
  actionLoading, inspecting,
  onLaunch, onClose, onScreenshot, onInspect,
}: Readonly<BrowserControlsCardProps>) {
  const inspectLabel = inspecting ? 'Click element...' : 'Inspect';

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Browser
          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {BadgeLabel({ statusLoading, isRunning })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <Button onClick={onLaunch} disabled={actionLoading || chromeDisabled}>
              {actionLoading ? <Spinner /> : null} Launch Browser
            </Button>
          ) : (
            <>
              <Button variant="destructive" onClick={onClose} disabled={actionLoading}>Stop Browser</Button>
              <Button variant="outline" onClick={onScreenshot} disabled={actionLoading}>Screenshot</Button>
              <Button variant="outline" onClick={onInspect} disabled={actionLoading || inspecting}>
                {inspecting ? <Spinner /> : null} {inspectLabel}
              </Button>
            </>
          )}
        </div>
        {isRunning && statusData ? <BrowserInfo statusData={statusData} /> : null}
      </CardContent>
    </Card>
  );
}
