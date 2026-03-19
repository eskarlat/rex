import { useState, useEffect, useCallback } from 'react';
import { Panel, FormField, CodeBlock, DataTable } from '@renre-kit/extension-sdk/components';
import type { RenreKitSDK, ScheduledTask } from '@renre-kit/extension-sdk';

interface PanelProps {
  sdk?: RenreKitSDK;
  extensionName?: string;
  projectPath?: string | null;
}

export default function HelloWorldPanel({ sdk, extensionName }: PanelProps) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [cronTask, setCronTask] = useState<ScheduledTask | null>(null);
  const [cronLoading, setCronLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ name: string; response: string; time: string }>>([]);

  const extName = extensionName ?? 'hello-world';

  async function handleGreet() {
    if (!sdk) {
      setGreeting(`Hello, ${name || 'World'}! (SDK not available)`);
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:greet`, { name: name || undefined });
      setGreeting(result.output);
      setHistory((prev) => [
        { name: name || 'World', response: result.output, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch {
      setGreeting('Failed to execute greet command.');
    } finally {
      setLoading(false);
    }
  }

  function handleToast() {
    if (!sdk) return;
    sdk.ui.toast({
      title: 'Hello from extension!',
      description: `Greetings from ${extName} at ${new Date().toLocaleTimeString()}`,
    });
  }

  // Poll for task execution and show toasts
  const pollTask = useCallback(() => {
    if (!sdk || !cronTask) return;
    sdk.scheduler.list().then((tasks) => {
      const current = tasks.find((t) => t.id === cronTask.id);
      if (current && current.last_run_at !== cronTask.last_run_at) {
        setCronTask(current);
        sdk.ui.toast({
          title: 'Cron tick',
          description: `Task ran at ${current.last_run_at ?? 'unknown'}`,
        });
      }
    }).catch(() => {});
  }, [sdk, cronTask]);

  useEffect(() => {
    if (!cronTask) return;
    const interval = setInterval(pollTask, 2000);
    return () => clearInterval(interval);
  }, [cronTask, pollTask]);

  async function handleCronToggle() {
    if (!sdk) return;
    setCronLoading(true);
    try {
      if (cronTask) {
        await sdk.scheduler.unregister(cronTask.id);
        sdk.ui.toast({ title: 'Cron stopped', variant: 'destructive' });
        setCronTask(null);
      } else {
        const task = await sdk.scheduler.register({
          extension_name: extName,
          cron: '*/3 * * * * *',
          command: `renre-kit ${extName}:greet`,
        });
        setCronTask(task);
        sdk.ui.toast({ title: 'Cron started', description: 'Running every 3 seconds' });
      }
    } catch {
      sdk.ui.toast({ title: 'Cron error', description: 'Failed to toggle cron task', variant: 'destructive' });
    } finally {
      setCronLoading(false);
    }
  }

  async function handleInfo() {
    if (!sdk) return;
    try {
      const result = await sdk.exec.run(`${extName}:info`);
      setGreeting(result.output);
    } catch {
      setGreeting('Failed to execute info command.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Greet"
        description="Send a greeting with an optional name. Uses companyName from extension settings."
      >
        <div className="flex flex-col gap-3">
          <FormField label="Name">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGreet().catch(() => {}); }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                onClick={() => { handleGreet().catch(() => {}); }}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Running...' : 'Greet'}
              </button>
            </div>
          </FormField>
          {greeting && <CodeBlock code={greeting} />}
        </div>
      </Panel>

      <Panel
        title="Toast & Cron Demo"
        description="Demonstrates SDK toast notifications and interval-based cron execution."
      >
        <div className="flex gap-2">
          <button
            onClick={handleToast}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Show Toast
          </button>
          <button
            onClick={() => { handleCronToggle().catch(() => {}); }}
            disabled={cronLoading}
            className={
              cronTask
                ? 'inline-flex h-9 items-center justify-center rounded-md border border-destructive bg-destructive/10 px-4 text-sm font-medium text-destructive shadow-sm hover:bg-destructive/20 disabled:opacity-50'
                : 'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
            }
          >
            {cronLoading ? '...' : cronTask ? 'Stop Cron' : 'Start Cron (every 3s)'}
          </button>
        </div>
      </Panel>

      <Panel
        title="Extension Info"
        description="View extension version and metadata."
      >
        <button
          onClick={() => { handleInfo().catch(() => {}); }}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          Show Info
        </button>
      </Panel>

      <Panel
        title="Commands"
        description="Available CLI commands for this extension."
      >
        <DataTable
          columns={[
            { key: 'command', label: 'Command' },
            { key: 'description', label: 'Description' },
          ]}
          data={[
            { command: `${extName}:greet`, description: 'Greet the user with a friendly message' },
            { command: `${extName}:info`, description: 'Show extension info' },
          ]}
        />
      </Panel>

      {history.length > 0 && (
        <Panel
          title="Greeting History"
          description="Recent greetings from this session."
        >
          <DataTable
            columns={[
              { key: 'time', label: 'Time' },
              { key: 'name', label: 'Name' },
              { key: 'response', label: 'Response' },
            ]}
            data={history}
          />
        </Panel>
      )}
    </div>
  );
}
