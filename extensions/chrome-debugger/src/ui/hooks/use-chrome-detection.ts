import { useState, useEffect, useCallback, useRef } from 'react';

import type { PanelSdk, ChromeCheckResult } from '../shared/types.js';

export function useChromeDetection(sdk: PanelSdk | undefined) {
  const [chromeCheck, setChromeCheck] = useState<ChromeCheckResult | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const autoConnectAttempted = useRef(false);

  useEffect(() => {
    if (!sdk) return;
    sdk.exec.run('chrome-debugger:chrome-check')
      .then((r) => {
        const check = JSON.parse(r.output) as ChromeCheckResult;
        setChromeCheck(check);

        // Auto-connect if a running browser is detected on the CDP port
        if (check.cdpRunning && !autoConnectAttempted.current) {
          autoConnectAttempted.current = true;
          void sdk.exec.run('chrome-debugger:connect', check.port ? { port: check.port } : {})
            .then(() => sdk.ui.toast({ title: 'Connected to running browser' }))
            .catch(() => { /* connection may fail if already managed */ });
        }
      })
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
