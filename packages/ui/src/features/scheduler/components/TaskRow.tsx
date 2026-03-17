import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  useUpdateTask,
  useDeleteTask,
  useTriggerTask,
} from '@/core/hooks/use-scheduler';
import { HistoryModal } from './HistoryModal';

interface TaskRowProps {
  task: {
    id: number;
    name: string;
    extension_name: string;
    command: string;
    cron: string;
    enabled: boolean;
    last_run?: string;
    next_run?: string;
  } | undefined;
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

  function handleToggle(checked: boolean) {
    if (!task) return;
    updateTask.mutate({ id: task.id, enabled: checked });
  }

  function handleTrigger() {
    if (!task) return;
    triggerTask.mutate(task.id);
  }

  function handleDelete() {
    if (!task) return;
    deleteTask.mutate(task.id);
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{task.name}</TableCell>
        <TableCell>{task.extension_name}</TableCell>
        <TableCell>
          <code className="text-sm">{task.cron}</code>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={task.enabled}
              onCheckedChange={handleToggle}
              aria-label="Toggle task"
            />
            <Badge variant={task.enabled ? 'default' : 'secondary'}>
              {task.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          {task.last_run
            ? new Date(task.last_run).toLocaleString()
            : 'Never'}
        </TableCell>
        <TableCell>
          {task.next_run
            ? new Date(task.next_run).toLocaleString()
            : '-'}
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={handleTrigger}>
              Run Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHistoryOpen(true)}
            >
              History
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
            >
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
