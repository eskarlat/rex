import { useCallback } from 'react';

import type { PanelSdk } from '../shared/types.js';

function notifyOnSuccess(
  sdk: PanelSdk,
  result: { output: string } | null,
  title: string,
  variant: 'success' | 'info',
): void {
  if (!result) return;
  sdk.notify({ title, message: title, variant });
}

export function useBrowserActions(
  sdk: PanelSdk,
  runAction: (cmd: string, args?: Record<string, unknown>) => Promise<{ output: string } | null>,
) {
  const handleLaunch = useCallback(() => {
    void runAction('launch').then((r) => notifyOnSuccess(sdk, r, 'Browser Started', 'success'));
  }, [sdk, runAction]);

  const handleClose = useCallback(() => {
    void runAction('close').then((r) => notifyOnSuccess(sdk, r, 'Browser Stopped', 'info'));
  }, [sdk, runAction]);

  const handleScreenshot = useCallback(() => {
    void runAction('screenshot');
  }, [runAction]);
  const handleNavigate = useCallback(
    (u: string) => {
      void runAction('navigate', { url: u });
    },
    [runAction],
  );
  const handleSwitchTab = useCallback(
    (i: number) => {
      void runAction('tab', { index: i });
    },
    [runAction],
  );

  const handleConnect = useCallback(() => {
    void runAction('connect').then((r) => notifyOnSuccess(sdk, r, 'Connected to Browser', 'success'));
  }, [sdk, runAction]);

  return { handleLaunch, handleClose, handleScreenshot, handleNavigate, handleSwitchTab, handleConnect };
}
