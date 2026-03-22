import { useState, useCallback } from 'react';

import type { PanelSdk } from '../shared/types.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useRunAction(sdk: PanelSdk, refreshStatus: () => Promise<void>) {
  const [actionLoading, setActionLoading] = useState(false);

  const runAction = useCallback(
    async (command: string, args?: Record<string, unknown>) => {
      setActionLoading(true);
      try {
        const result = await sdk.exec.run(`chrome-debugger:${command}`, args);
        // Small delay before refreshing to let the backend state settle
        // (e.g., after launch, the browser needs time to initialize)
        await delay(500);
        await refreshStatus();
        return result;
      } catch (err) {
        sdk.ui.toast({ title: 'Error', description: err instanceof Error ? err.message : String(err) });
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [sdk, refreshStatus]
  );

  return { actionLoading, runAction };
}
