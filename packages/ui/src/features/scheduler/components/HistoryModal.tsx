import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskHistory } from '@/core/hooks/use-scheduler';

interface HistoryModalProps {
  taskId: number;
  taskName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({
  taskId,
  taskName,
  open,
  onOpenChange,
}: HistoryModalProps) {
  const { data: history, isLoading } = useTaskHistory(open ? taskId : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task History: {taskName}</DialogTitle>
          <DialogDescription>
            Execution history for this scheduled task.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Output</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!history || history.length === 0) ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No execution history.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.started_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.finished_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.duration_ms}ms</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'success'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.output ?? entry.error ?? '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
