import { useCallback } from 'react';

import type { PanelSdk } from '../shared/types.js';

export function useBrowserActions(
  sdk: PanelSdk,
  runAction: (cmd: string, args?: Record<string, unknown>) => Promise<{ output: string } | null>
) {
  const handleLaunch = useCallback(() => {
    void runAction('launch').then(() => { sdk.notify({ title: 'Browser Started', variant: 'success' }); });
  }, [sdk, runAction]);

  const handleClose = useCallback(() => {
    void runAction('close').then(() => { sdk.notify({ title: 'Browser Stopped', variant: 'info' }); });
  }, [sdk, runAction]);

  const handleScreenshot = useCallback(() => { void runAction('screenshot'); }, [runAction]);
  const handleNavigate = useCallback((u: string) => { void runAction('navigate', { url: u }); }, [runAction]);
  const handleSwitchTab = useCallback((i: number) => { void runAction('tab', { index: i }); }, [runAction]);

  const handleConnect = useCallback(() => {
    void runAction('connect').then(() => { sdk.notify({ title: 'Connected to Browser', variant: 'success' }); });
  }, [sdk, runAction]);

  return { handleLaunch, handleClose, handleScreenshot, handleNavigate, handleSwitchTab, handleConnect };
}
