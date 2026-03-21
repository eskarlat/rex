import { useState, useCallback } from 'react';

import type { PanelSdk } from '../shared/types.js';

export function useInspect(sdk: PanelSdk | undefined) {
  const [inspecting, setInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const handleInspect = useCallback(() => {
    if (!sdk) return;
    setInspecting(true);
    setSelectedElement(null);
    void sdk.exec.run('chrome-debugger:inspect')
      .then(() => sdk.exec.run('chrome-debugger:selected'))
      .then((r) => setSelectedElement(r.output))
      .catch((e: unknown) => sdk.ui.toast({ title: 'Inspect failed', description: e instanceof Error ? e.message : String(e) }))
      .finally(() => setInspecting(false));
  }, [sdk]);

  return { inspecting, selectedElement, handleInspect };
}
