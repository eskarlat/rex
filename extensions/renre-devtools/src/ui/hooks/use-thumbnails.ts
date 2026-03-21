import { useState, useEffect, useCallback } from 'react';

import type { PanelSdk, ScreenshotMeta } from '../shared/types.js';

export function useThumbnails(sdk: PanelSdk, screenshots: ScreenshotMeta[]) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    for (const ss of screenshots) {
      if (thumbnails[ss.path]) continue;
      void sdk.exec.run('renre-devtools:screenshot-read', { path: ss.path })
        .then((result) => {
          const data = JSON.parse(result.output) as { dataUrl: string };
          setThumbnails((prev) => ({ ...prev, [ss.path]: data.dataUrl }));
        })
        .catch(() => { /* skip failed thumbnails */ });
    }
  }, [sdk, screenshots, thumbnails]);

  const clearThumbnail = useCallback((path: string) => {
    setThumbnails((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  return { thumbnails, clearThumbnail };
}
