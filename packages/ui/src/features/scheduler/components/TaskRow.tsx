import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  useUpdateTask,
  useDeleteTask,
  useTriggerTask,
  type ScheduledTask,
} from '@/core/hooks/use-scheduler';
import { HistoryModal } from './HistoryModal';

interface TaskRowProps {
  task: ScheduledTask | undefined;
}

export function TaskRow({ task }: TaskRowProps) {
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
