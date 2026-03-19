import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useRegistries,
  useAddRegistry,
  useRemoveRegistry,
  useSyncRegistry,
} from '@/core/hooks/use-registries';
import { ResourcePage } from '@/core/components/ResourcePage';

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

  return (
    <ResourcePage
      title="Registries"
      description="Manage extension registries."
      isLoading={isLoading}
      dialogOpen={open}
      onDialogOpenChange={setOpen}
      dialogTitle="Add Registry"
      dialogDescription="Add a new extension registry source."
      triggerLabel="Add Registry"
      submitLabel="Add"
      submitPendingLabel="Adding..."
      submitDisabled={!name || !url || addRegistry.isPending}
      isPending={addRegistry.isPending}
      onSubmit={handleAdd}
      formContent={
        <>
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
        </>
      }
    >
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
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
    </ResourcePage>
  );
}
