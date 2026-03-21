import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@renre-kit/extension-sdk/components';

import { ConsoleLogView } from '../components/ConsoleLogView.js';
import { FilterBar } from '../components/FilterBar.js';
import { NetworkLogView } from '../components/NetworkLogView.js';
import { useBrowserStatus } from '../hooks/use-browser-status.js';
import { useLogPolling } from '../hooks/use-log-polling.js';
import type { PanelProps, PanelSdk } from '../shared/types.js';

export default function LogsPanel({ sdk }: Partial<PanelProps>) {
  const { data: statusData } = useBrowserStatus(sdk);
  const isRunning = statusData?.running ?? false;

  const [paused, setPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('console');

  const consoleScrollRef = useRef<HTMLDivElement>(null);
  const networkScrollRef = useRef<HTMLDivElement>(null);

  const sdkRef = sdk as PanelSdk;
  const { consoleEntries, networkEntries, consoleTotalLines, networkTotalLines, clear } =
    useLogPolling(sdkRef, isRunning, paused, levelFilter, methodFilter);

  // Auto-scroll
  useEffect(() => {
    if (!paused && consoleScrollRef.current) {
      consoleScrollRef.current.scrollTop = consoleScrollRef.current.scrollHeight;
    }
  }, [consoleEntries, paused]);

  useEffect(() => {
    if (!paused && networkScrollRef.current) {
      networkScrollRef.current.scrollTop = networkScrollRef.current.scrollHeight;
    }
  }, [networkEntries, paused]);

  const handleClearLogs = useCallback(async () => {
    try {
      await sdkRef.exec.run('renre-devtools:clear-logs');
      clear();
      sdkRef.ui.toast({ title: 'Logs cleared' });
    } catch (err) {
      sdkRef.ui.toast({ title: 'Clear failed', description: err instanceof Error ? err.message : String(err) });
    }
  }, [sdkRef, clear]);

  if (!sdk) return <div style={{ padding: '16px' }}>SDK not available</div>;

  if (!isRunning) {
    return (
      <Card>
        <CardContent style={{ padding: '48px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px' }}>Browser Not Running</h3>
          <p style={{ color: 'var(--muted-foreground, #94a3b8)', margin: 0 }}>
            Launch a browser from the Overview panel to see logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant={paused ? 'default' : 'outline'} size="sm" onClick={() => setPaused(!paused)}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void handleClearLogs()}>Clear</Button>
        {paused ? <Badge variant="secondary">Paused</Badge> : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="console">Console ({consoleTotalLines})</TabsTrigger>
          <TabsTrigger value="network">Network ({networkTotalLines})</TabsTrigger>
        </TabsList>

        <TabsContent value="console">
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Console
                <FilterBar options={['all', 'log', 'warning', 'error']} active={levelFilter} onSelect={setLevelFilter} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConsoleLogView entries={consoleEntries} scrollRef={consoleScrollRef} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Network
                <FilterBar options={['all', 'GET', 'POST', 'PUT', 'DELETE']} active={methodFilter} onSelect={setMethodFilter} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkLogView entries={networkEntries} scrollRef={networkScrollRef} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
