import { useState, useEffect } from 'react';
import { Panel, DataTable, CodeBlock } from '@renre-kit/extension-sdk/components';
import type { RenreKitSDK, ScheduledTask } from '@renre-kit/extension-sdk';

interface PanelProps {
  sdk?: RenreKitSDK;
  extensionName?: string;
  projectPath?: string | null;
}

export default function AnalyticsPanel({ sdk, extensionName }: PanelProps) {
  const extName = extensionName ?? 'hello-world';
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.scheduler.list()
      .then((all) => setTasks(all.filter((t) => t.extension_name === extName)))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [sdk, extName]);

  async function handleRefresh() {
    if (!sdk) return;
    setLoading(true);
    try {
      const all = await sdk.scheduler.list();
      setTasks(all.filter((t) => t.extension_name === extName));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Scheduled Tasks"
        description={`Active scheduled tasks for ${extName}.`}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { handleRefresh().catch(() => {}); }}
            disabled={loading}
            className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          {tasks.length > 0 ? (
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'cron', label: 'Schedule' },
                { key: 'command', label: 'Command' },
                { key: 'last_run_at', label: 'Last Run' },
              ]}
              data={tasks.map((t) => ({
                id: String(t.id),
                cron: t.cron,
                command: t.command,
                last_run_at: t.last_run_at ?? 'Never',
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No scheduled tasks. Use the main panel to start a cron task.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Debug Info"
        description="Raw extension state for debugging."
      >
        <CodeBlock code={JSON.stringify({ extensionName: extName, taskCount: tasks.length, tasks }, null, 2)} />
      </Panel>
    </div>
  );
}
