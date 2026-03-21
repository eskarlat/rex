import { useState, useEffect, useCallback } from 'react';

import type { PanelSdk, ChromeCheckResult } from '../shared/types.js';

export function useChromeDetection(sdk: PanelSdk | undefined) {
  const [chromeCheck, setChromeCheck] = useState<ChromeCheckResult | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!sdk) return;
    sdk.exec.run('chrome-debugger:chrome-check')
      .then((r) => setChromeCheck(JSON.parse(r.output) as ChromeCheckResult))
      .catch(() => setChromeCheck({ found: false, canInstall: true }));
  }, [sdk]);

  const handleInstall = useCallback(() => {
    if (!sdk) return;
    setInstalling(true);
    void sdk.exec.run('chrome-debugger:chrome-install')
      .then((r) => {
        const data = JSON.parse(r.output) as { installed: boolean; path?: string };
        if (data.installed) {
          setChromeCheck({ found: true, path: data.path, source: 'puppeteer' });
          sdk.ui.toast({ title: 'Chromium installed successfully' });
        }
      })
      .catch((e: unknown) => sdk.ui.toast({ title: 'Installation failed', description: e instanceof Error ? e.message : String(e) }))
      .finally(() => { setInstalling(false); setInstallDialogOpen(false); });
  }, [sdk]);

  return { chromeCheck, installDialogOpen, setInstallDialogOpen, installing, handleInstall };
}
