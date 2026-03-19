import { DynamicUiAsset } from '@/core/components/UiAssetErrorBoundary';

interface DynamicWidgetProps {
  extensionName: string;
  widgetId: string;
}

export function DynamicWidget({ extensionName, widgetId }: DynamicWidgetProps) {
  const widgetUrl = `/api/extensions/${extensionName}/widgets/${widgetId}.js`;

  return (
    <DynamicUiAsset
      extensionName={extensionName}
      url={widgetUrl}
      label="widget"
      compact
    />
  );
}
