import { ConfluenceUpdatesWidget as BaseConfluenceUpdatesWidget } from '@renre-kit/extension-sdk/components';
import type { ConfluenceUpdatesWidgetProps } from '@renre-kit/extension-sdk/components';

export default function ConfluenceUpdatesWidget(props: ConfluenceUpdatesWidgetProps) {
  return (
    <BaseConfluenceUpdatesWidget
      defaultExtensionName="atlassian-mcp"
      searchCommand="confluence_search"
      {...props}
    />
  );
}
