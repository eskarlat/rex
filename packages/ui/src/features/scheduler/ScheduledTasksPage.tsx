import { type ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useScheduledTasks,
  useCreateTask,
} from '@/core/hooks/use-scheduler';
import { TaskRow } from './components/TaskRow';

export function ScheduledTasksPage(): React.ReactElement {
  const { data: tasks, isLoading } = useScheduledTasks();
  const createTask = useCreateTask();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [extensionName, setExtensionName] = useState('');
  const [command, setCommand] = useState('');
  const [cron, setCron] = useState('');

  function handleCreate(): void {
    if (!name || !extensionName || !command || !cron) return;
    createTask.mutate(
      { name, extension_name: extensionName, command, cron },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setExtensionName('');
          setCommand('');
          setCron('');
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Scheduler</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduler</h1>
          <p className="text-muted-foreground">
            Manage scheduled tasks and view execution history.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Scheduled Task</DialogTitle>
              <DialogDescription>
                Schedule a recurring extension command.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Name</Label>
                <Input
                  id="task-name"
                  placeholder="Task name"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-extension">Extension</Label>
                <Input
                  id="task-extension"
                  placeholder="Extension name"
                  value={extensionName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setExtensionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-command">Command</Label>
                <Input
                  id="task-command"
                  placeholder="Command to run"
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
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={
                  !name ||
                  !extensionName ||
                  !command ||
                  !cron ||
                  createTask.isPending
                }
              >
                {createTask.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Extension</TableHead>
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
  );
}
