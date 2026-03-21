import { DynamicUiAsset } from '@/core/components/UiAssetErrorBoundary';

interface DynamicPanelProps {
  extensionName: string;
  panelId?: string;
}

export function DynamicPanel({ extensionName, panelId }: Readonly<DynamicPanelProps>) {
  const panelUrl = panelId
    ? `/api/extensions/${extensionName}/panels/${panelId}.js`
    : `/api/extensions/${extensionName}/panel.js`;

  return <DynamicUiAsset extensionName={extensionName} url={panelUrl} label="panel" />;
}
