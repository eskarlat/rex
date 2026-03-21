import { ActiveLogLevels } from './components/ActiveLogLevels';
import { ExtensionLogsTab } from './components/ExtensionLogsTab';
import { ServerConsoleTab } from './components/ServerConsoleTab';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LogsPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
          <p className="text-sm text-muted-foreground">
            Real-time log stream from the dashboard server
          </p>
        </div>
        <ActiveLogLevels />
      </div>

      <Tabs defaultValue="extension" className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-fit">
          <TabsTrigger value="extension">Extension Logs</TabsTrigger>
          <TabsTrigger value="console">Server Console</TabsTrigger>
        </TabsList>
        <TabsContent
          value="extension"
          className="flex-1 flex flex-col gap-3 min-h-0 data-[state=inactive]:hidden"
        >
          <ExtensionLogsTab />
        </TabsContent>
        <TabsContent
          value="console"
          className="flex-1 flex flex-col gap-3 min-h-0 data-[state=inactive]:hidden"
        >
          <ServerConsoleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
