import { useState, useCallback } from 'react';

import type { PanelSdk } from '../shared/types.js';

export function useRunAction(sdk: PanelSdk, refreshStatus: () => void) {
  const [actionLoading, setActionLoading] = useState(false);

  const runAction = useCallback(
    async (command: string, args?: Record<string, unknown>) => {
      setActionLoading(true);
      try {
        const result = await sdk.exec.run(`chrome-debugger:${command}`, args);
        refreshStatus();
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
