import {
  Alert, AlertTitle, AlertDescription, Button,
} from '@renre-kit/extension-sdk/components';

import type { ChromeCheckResult } from '../shared/types.js';

interface ChromeAlertProps {
  chromeCheck: ChromeCheckResult;
  onInstallClick: () => void;
}

export function ChromeAlert({ chromeCheck, onInstallClick }: Readonly<ChromeAlertProps>) {
  if (chromeCheck.found) return null;
  return (
    <Alert>
      <AlertTitle>Chrome Not Found</AlertTitle>
      <AlertDescription>
        No Chrome or Chromium installation detected.
        <Button variant="outline" size="sm" style={{ marginLeft: '8px' }} onClick={onInstallClick}>
          Download Chromium
        </Button>
      </AlertDescription>
    </Alert>
  );
}
