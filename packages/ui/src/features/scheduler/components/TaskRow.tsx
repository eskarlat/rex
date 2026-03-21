import { useState } from 'react';

import { HistoryModal } from './HistoryModal';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useUpdateTask,
  useDeleteTask,
  useTriggerTask,
  type ScheduledTask,
} from '@/core/hooks/use-scheduler';

interface TaskRowProps {
  task: ScheduledTask | undefined;
}

function TaskCardMobile({ task }: Readonly<{ task: ScheduledTask }>) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const triggerTask = useTriggerTask();
  const [historyOpen, setHistoryOpen] = useState(false);

  const isEnabled = task.enabled === 1;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-medium">
              {task.name}
              <Badge variant="outline" className="ml-2 text-xs">
                {task.type}
              </Badge>
            </CardTitle>
            <code className="mt-1 block text-xs text-muted-foreground">{task.command}</code>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) =>
                updateTask.mutate({ id: task.id, enabled: checked ? 1 : 0 })
              }
              aria-label="Toggle task"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Cron: <code className="text-foreground">{task.cron}</code>
            </span>
            <span>
              Last: {task.last_run_at ? new Date(task.last_run_at).toLocaleString() : 'Never'}
            </span>
            <span>
              Next: {task.next_run_at ? new Date(task.next_run_at).toLocaleString() : '-'}
            </span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => triggerTask.mutate(task.id)}>
              Run Now
            </Button>
            <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
              History
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteTask.mutate(task.id)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
      <HistoryModal
        taskId={task.id}
        taskName={task.name}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </>
  );
}

export { TaskCardMobile };

export function TaskRow({ task }: Readonly<TaskRowProps>) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const triggerTask = useTriggerTask();
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!task) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
          No scheduled tasks.
        </TableCell>
      </TableRow>
    );
  }

  const isEnabled = task.enabled === 1;

  return (
    <>
      <TableRow>
        <TableCell>
          <span className="font-medium">{task.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {task.type}
          </Badge>
        </TableCell>
        <TableCell>
          <code className="text-xs text-muted-foreground">{task.command}</code>
        </TableCell>
        <TableCell>
          <code className="text-sm">{task.cron}</code>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) =>
                updateTask.mutate({ id: task.id, enabled: checked ? 1 : 0 })
              }
              aria-label="Toggle task"
            />
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          {task.last_run_at ? new Date(task.last_run_at).toLocaleString() : 'Never'}
        </TableCell>
        <TableCell>
          {task.next_run_at ? new Date(task.next_run_at).toLocaleString() : '-'}
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => triggerTask.mutate(task.id)}>
              Run Now
            </Button>
            <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
              History
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteTask.mutate(task.id)}>
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <HistoryModal
        taskId={task.id}
        taskName={task.name}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </>
  );
}
