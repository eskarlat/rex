import { ActiveLogLevels } from './components/ActiveLogLevels';
import { ExtensionLogsTab } from './components/ExtensionLogsTab';
import { ServerConsoleTab } from './components/ServerConsoleTab';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LogsPage() {
  return (
    <div className="flex h-full flex-col gap-3 md:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Logs</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Real-time log stream from the dashboard server
          </p>
        </div>
        <ActiveLogLevels />
      </div>

      <Tabs defaultValue="extension" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="extension">Extension Logs</TabsTrigger>
          <TabsTrigger value="console">Server Console</TabsTrigger>
        </TabsList>
        <TabsContent
          value="extension"
          className="flex min-h-0 flex-1 flex-col gap-3 data-[state=inactive]:hidden"
        >
          <ExtensionLogsTab />
        </TabsContent>
        <TabsContent
          value="console"
          className="flex min-h-0 flex-1 flex-col gap-3 data-[state=inactive]:hidden"
        >
          <ServerConsoleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
