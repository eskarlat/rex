import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  taskId: string;
  taskName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ taskId, taskName, open, onOpenChange }: HistoryModalProps) {
  const { data: history, isLoading } = useTaskHistory(open ? taskId : '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task History: {taskName}</DialogTitle>
          <DialogDescription>Execution history for this scheduled task.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ScrollArea className="max-h-96">
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
                {!history || history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No execution history.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.started_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {entry.finished_at ? new Date(entry.finished_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.duration_ms != null ? `${entry.duration_ms}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <pre className="max-h-24 max-w-xs overflow-auto whitespace-pre-wrap text-xs font-mono">
                          {entry.output ?? '-'}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
