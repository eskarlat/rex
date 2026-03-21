import {
  Button, Spinner,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@renre-kit/extension-sdk/components';

interface InstallDialogProps {
  open: boolean;
  installing: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export function InstallDialog({ open, installing, onClose, onInstall }: Readonly<InstallDialogProps>) {
  const buttonLabel = installing ? 'Downloading...' : 'Download';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Chromium</DialogTitle>
          <DialogDescription>
            Chromium (~200MB) will be downloaded via Puppeteer. This is a one-time setup.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={installing}>Cancel</Button>
          <Button onClick={onInstall} disabled={installing}>
            {installing ? <Spinner /> : null} {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
