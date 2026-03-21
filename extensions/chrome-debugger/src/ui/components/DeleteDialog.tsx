import {
  Button, Spinner,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@renre-kit/extension-sdk/components';

import type { ScreenshotMeta } from '../shared/types.js';

interface DeleteDialogProps {
  target: ScreenshotMeta | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ target, deleting, onClose, onConfirm }: Readonly<DeleteDialogProps>) {
  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Screenshot</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{target?.filename}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? <Spinner /> : null} Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
