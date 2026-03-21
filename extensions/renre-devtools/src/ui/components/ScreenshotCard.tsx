import { Button, Spinner } from '@renre-kit/extension-sdk/components';

import type { ScreenshotMeta } from '../shared/types.js';

interface ScreenshotCardProps {
  ss: ScreenshotMeta;
  thumbnail: string | undefined;
  onPreview: () => void;
  onDelete: () => void;
}

function Thumbnail({ src, alt }: Readonly<{ src: string | undefined; alt: string }>) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return <Spinner />;
}

export function ScreenshotCard({ ss, thumbnail, onPreview, onDelete }: Readonly<ScreenshotCardProps>) {
  return (
    <div
      style={{ border: '1px solid var(--border, #333)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
      onClick={onPreview}
    >
      <div style={{ aspectRatio: '16/9', background: 'var(--muted, #1e1e1e)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Thumbnail src={thumbnail} alt={ss.filename} />
      </div>
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ss.filename}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted-foreground, #94a3b8)', marginTop: '2px' }}>
          {new Date(ss.timestamp).toLocaleString()}
        </div>
        <div style={{ marginTop: '4px' }}>
          <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
