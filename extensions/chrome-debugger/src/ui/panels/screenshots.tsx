import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@renre-kit/extension-sdk/components';

import { DeleteDialog } from '../components/DeleteDialog.js';
import { PreviewDialog } from '../components/PreviewDialog.js';
import { ScreenshotCard } from '../components/ScreenshotCard.js';
import { useThumbnails } from '../hooks/use-thumbnails.js';
import type { PanelProps, PanelSdk, ScreenshotMeta } from '../shared/types.js';

export default function ScreenshotsPanel({ sdk }: Partial<PanelProps>) {
  const [screenshots, setScreenshots] = useState<ScreenshotMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<ScreenshotMeta | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScreenshotMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sdkRef = sdk as PanelSdk;
  const { thumbnails, clearThumbnail } = useThumbnails(sdkRef, screenshots);

  const loadScreenshots = useCallback(async () => {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run('chrome-debugger:screenshot-list');
      const data = JSON.parse(result.output) as { screenshots: ScreenshotMeta[] };
      setScreenshots(data.screenshots);
    } catch {
      setScreenshots([]);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    void loadScreenshots();
  }, [loadScreenshots]);

  const handlePreview = useCallback(async (meta: ScreenshotMeta) => {
    setSelectedScreenshot(meta);
    const cached = thumbnails[meta.path];
    if (cached) {
      setPreviewDataUrl(cached);
      return;
    }
    setPreviewLoading(true);
    try {
      const result = await sdkRef.exec.run('chrome-debugger:screenshot-read', { path: meta.path });
      setPreviewDataUrl((JSON.parse(result.output) as { dataUrl: string }).dataUrl);
    } catch {
      setPreviewDataUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [sdkRef, thumbnails]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sdkRef.exec.run('chrome-debugger:screenshot-delete', { path: deleteTarget.path });
      sdkRef.ui.toast({ title: 'Screenshot deleted' });
      clearThumbnail(deleteTarget.path);
      setDeleteTarget(null);
      await loadScreenshots();
    } catch (err) {
      sdkRef.ui.toast({ title: 'Delete failed', description: err instanceof Error ? err.message : String(err) });
    } finally {
      setDeleting(false);
    }
  }, [sdkRef, deleteTarget, loadScreenshots, clearThumbnail]);

  if (!sdk) return <div style={{ padding: '16px' }}>SDK not available</div>;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner /></div>;
  }

  if (screenshots.length === 0) {
    return (
      <Card>
        <CardContent style={{ padding: '48px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px' }}>No Screenshots</h3>
          <p style={{ color: 'var(--muted-foreground, #94a3b8)', margin: 0 }}>
            Take a screenshot from the Overview panel to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <CardHeader><CardTitle>Screenshots ({screenshots.length})</CardTitle></CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {screenshots.map((ss) => (
              <ScreenshotCard
                key={ss.path} ss={ss} thumbnail={thumbnails[ss.path]}
                onPreview={() => void handlePreview(ss)}
                onDelete={() => setDeleteTarget(ss)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PreviewDialog
        screenshot={selectedScreenshot} dataUrl={previewDataUrl} loading={previewLoading}
        onClose={() => setSelectedScreenshot(null)}
      />

      <DeleteDialog
        target={deleteTarget} deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
