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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useVaultEntries,
  useSetVaultEntry,
  useRemoveVaultEntry,
} from '@/core/hooks/use-vault';

export function VaultPage(): React.ReactElement {
  const { data: entries, isLoading } = useVaultEntries();
  const setEntry = useSetVaultEntry();
  const removeEntry = useRemoveVaultEntry();
  const [open, setOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTags, setNewTags] = useState('');

  function handleAdd(): void {
    if (!newKey || !newValue) return;
    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setEntry.mutate(
      { key: newKey, value: newValue, secret: true, tags: tags.length > 0 ? tags : undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setNewKey('');
          setNewValue('');
          setNewTags('');
        },
      }
    );
  }

  function handleRemove(key: string): void {
    removeEntry.mutate(key);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Vault</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vault</h1>
          <p className="text-muted-foreground">
            Manage encrypted secrets and keys.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vault Entry</DialogTitle>
              <DialogDescription>
                Store a new encrypted secret in the vault.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vault-key">Key</Label>
                <Input
                  id="vault-key"
                  placeholder="e.g. GITHUB_TOKEN"
                  value={newKey}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vault-value">Value</Label>
                <Input
                  id="vault-value"
                  type="password"
                  placeholder="Secret value"
                  value={newValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vault-tags">Tags (comma-separated)</Label>
                <Input
                  id="vault-tags"
                  placeholder="e.g. github, api"
                  value={newTags}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTags(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAdd}
                disabled={!newKey || !newValue || setEntry.isPending}
              >
                {setEntry.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!entries || entries.length === 0) ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No vault entries found.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.key}>
                <TableCell className="font-medium">{entry.key}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {'******'}
                </TableCell>
                <TableCell>{entry.tags?.join(', ') ?? '-'}</TableCell>
                <TableCell>
                  {new Date(entry.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={removeEntry.isPending}
                    onClick={() => handleRemove(entry.key)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
