import { ActiveActions } from './ActiveActions';
import { AvailableActions } from './AvailableActions';
import { InstalledActions } from './InstalledActions';

import type { Extension } from '@/core/hooks/use-extensions';

export { UpdateBadge } from './UpdateBadge';

interface ExtensionActionsProps {
  extension: Extension;
}

export function ExtensionActions({ extension }: Readonly<ExtensionActionsProps>) {
  if (extension.status === 'available') return <AvailableActions extension={extension} />;
  if (extension.status === 'installed') return <InstalledActions extension={extension} />;
  if (extension.status === 'active') return <ActiveActions extension={extension} />;
  return null;
}
