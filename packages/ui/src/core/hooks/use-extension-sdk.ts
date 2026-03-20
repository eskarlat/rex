import { useMemo, useEffect } from 'react';
import { RenreKitSDKImpl } from '@renre-kit/extension-sdk';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { showToast } from '@/core/hooks/use-toast';
import { useTerminal } from '@/features/terminal/use-terminal';
import type { RenreKitSDK } from '@renre-kit/extension-sdk';

export function useExtensionSDK(extensionName: string): RenreKitSDK {
  const { activeProject } = useProjectContext();
  const navigate = useNavigate();
  const { open: openTerminal, close: closeTerminal, send: sendToTerminal } = useTerminal();

  const sdk = useMemo(() => {
    const instance = new RenreKitSDKImpl(
      { baseUrl: '', projectPath: activeProject },
      extensionName,
    );
    instance.ui.setToastHandler((options) => {
      showToast(options);
    });
    instance.ui.setNavigateHandler((path) => {
      Promise.resolve(navigate(path)).catch(() => { /* navigation error */ });
    });
    instance.terminal.setOpenHandler(() => {
      openTerminal();
    });
    instance.terminal.setCloseHandler(() => {
      closeTerminal();
    });
    instance.terminal.setSendHandler((data) => {
      sendToTerminal(data);
    });
    return instance;
  }, [extensionName, activeProject, navigate, openTerminal, closeTerminal, sendToTerminal]);

  useEffect(() => {
    return () => sdk.destroy();
  }, [sdk]);

  return sdk;
}
