import { type ChangeEvent, useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useScheduledTasks,
  useCreateTask,
} from '@/core/hooks/use-scheduler';
import { ResourcePage } from '@/core/components/ResourcePage';
import { TaskRow } from './components/TaskRow';

export function ScheduledTasksPage(): React.ReactElement {
  const { data: tasks, isLoading } = useScheduledTasks();
  const createTask = useCreateTask();
  const [open, setOpen] = useState(false);
  const [extensionName, setExtensionName] = useState('');
  const [command, setCommand] = useState('');
  const [cron, setCron] = useState('');

  function handleCreate(): void {
    if (!extensionName || !command || !cron) return;
    createTask.mutate(
      { extension_name: extensionName, command, cron },
      {
        onSuccess: () => {
          setOpen(false);
          setExtensionName('');
          setCommand('');
          setCron('');
        },
      }
    );
  }

  return (
    <ResourcePage
      title="Scheduler"
      description="Manage scheduled tasks and view execution history."
      isLoading={isLoading}
      dialogOpen={open}
      onDialogOpenChange={setOpen}
      dialogTitle="Create Scheduled Task"
      dialogDescription="Schedule a recurring extension command."
      triggerLabel="Create Task"
      submitLabel="Create"
      submitPendingLabel="Creating..."
      submitDisabled={
        !extensionName || !command || !cron || createTask.isPending
      }
      isPending={createTask.isPending}
      onSubmit={handleCreate}
      formContent={
        <>
          <div className="space-y-2">
            <Label htmlFor="task-extension">Task Name</Label>
            <Input
              id="task-extension"
              placeholder="e.g. auto-greet, daily-sync"
              value={extensionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setExtensionName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-command">Command</Label>
            <Input
              id="task-command"
              placeholder="renre-kit hello-world:greet"
              value={command}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCommand(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-cron">Cron Expression</Label>
            <Input
              id="task-cron"
              placeholder="*/5 * * * *"
              value={cron}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCron(e.target.value)}
            />
          </div>
        </>
      }
    >
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Command</TableHead>
            <TableHead>Cron</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead className="w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!tasks || tasks.length === 0) ? (
            <TaskRow task={undefined} />
          ) : (
            tasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </TableBody>
      </Table>
      </div>
    </ResourcePage>
  );
}
