import { useEffect } from 'react';

import type { PanelSdk } from '../shared/types.js';

export function useHeartbeat(sdk: PanelSdk | undefined, isRunning: boolean): void {
  useEffect(() => {
    if (!sdk || !isRunning) return;
    const timer = setInterval(() => { void sdk.exec.run('renre-devtools:heartbeat'); }, 30_000);
    return () => { clearInterval(timer); };
  }, [sdk, isRunning]);
}
