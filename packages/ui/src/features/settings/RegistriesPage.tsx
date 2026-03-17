import { useState } from 'react';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useRegistries,
  useAddRegistry,
  useRemoveRegistry,
  useSyncRegistry,
} from '@/core/hooks/use-registries';

export function RegistriesPage() {
  const { data: registries, isLoading } = useRegistries();
  const addRegistry = useAddRegistry();
  const removeRegistry = useRemoveRegistry();
  const syncRegistry = useSyncRegistry();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('0');

  function handleAdd() {
    if (!name || !url) return;
    addRegistry.mutate(
      { name, url, priority: Number(priority) },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setUrl('');
          setPriority('0');
        },
      }
    );
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Registries</h2>
          <p className="text-sm text-muted-foreground">
            Manage extension registries.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Registry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Registry</DialogTitle>
              <DialogDescription>
                Add a new extension registry source.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Name</Label>
                <Input
                  id="reg-name"
                  placeholder="Registry name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-url">URL</Label>
                <Input
                  id="reg-url"
                  placeholder="https://github.com/user/registry"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-priority">Priority</Label>
                <Input
                  id="reg-priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAdd}
                disabled={!name || !url || addRegistry.isPending}
              >
                {addRegistry.isPending ? 'Adding...' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Last Synced</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!registries || registries.length === 0) ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No registries configured.
              </TableCell>
            </TableRow>
          ) : (
            registries.map((reg) => (
              <TableRow key={reg.name}>
                <TableCell className="font-medium">{reg.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {reg.url}
                </TableCell>
                <TableCell>{reg.priority}</TableCell>
                <TableCell>
                  {reg.last_synced
                    ? new Date(reg.last_synced).toLocaleString()
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={syncRegistry.isPending}
                      onClick={() => syncRegistry.mutate(reg.name)}
                    >
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={removeRegistry.isPending}
                      onClick={() => removeRegistry.mutate(reg.name)}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
