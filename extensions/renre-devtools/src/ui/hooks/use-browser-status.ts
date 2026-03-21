import { useCallback } from 'react';

import type { PanelSdk, BrowserStatusData } from '../shared/types.js';

import { usePolling } from './use-polling.js';

export function useBrowserStatus(sdk: PanelSdk | undefined) {
  const fetchStatus = useCallback(async (): Promise<BrowserStatusData> => {
    if (!sdk) return { running: false };
    const result = await sdk.exec.run('renre-devtools:status');
    return JSON.parse(result.output) as BrowserStatusData;
  }, [sdk]);

  return usePolling(fetchStatus, 3000, !!sdk);
}
