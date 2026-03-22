import { StatusWidget as BaseStatusWidget } from '@renre-kit/extension-sdk/components';
import type { StatusWidgetProps } from '@renre-kit/extension-sdk/components';

export default function StatusWidget(props: StatusWidgetProps) {
  return <BaseStatusWidget defaultExtensionName="figma-mcp" {...props} />;
}
