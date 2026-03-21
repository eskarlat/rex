import {
  Spinner,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@renre-kit/extension-sdk/components';

import type { ScreenshotMeta } from '../shared/types.js';

interface PreviewDialogProps {
  screenshot: ScreenshotMeta | null;
  dataUrl: string | null;
  loading: boolean;
  onClose: () => void;
}

function buildDescription(screenshot: ScreenshotMeta | null): string {
  if (!screenshot) return '';
  const urlPart = screenshot.url ? `URL: ${screenshot.url}` : '';
  const timePart = screenshot.timestamp ? new Date(screenshot.timestamp).toLocaleString() : '';
  return [urlPart, timePart].filter(Boolean).join(' · ');
}

function PreviewContent({ loading, dataUrl, alt }: Readonly<{ loading: boolean; dataUrl: string | null; alt: string }>) {
  if (loading) return <Spinner />;
  if (dataUrl) {
    return <img src={dataUrl} alt={alt} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />;
  }
  return <span>Failed to load preview</span>;
}

export function PreviewDialog({ screenshot, dataUrl, loading, onClose }: Readonly<PreviewDialogProps>) {
  return (
    <Dialog open={!!screenshot} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle>{screenshot?.filename}</DialogTitle>
          <DialogDescription>{buildDescription(screenshot)}</DialogDescription>
        </DialogHeader>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <PreviewContent loading={loading} dataUrl={dataUrl} alt={screenshot?.filename ?? 'Screenshot'} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
