import { CommentsWidget as BaseCommentsWidget } from '@renre-kit/extension-sdk/components';
import type { CommentsWidgetProps } from '@renre-kit/extension-sdk/components';

export default function CommentsWidget(props: CommentsWidgetProps) {
  return <BaseCommentsWidget defaultExtensionName="atlassian-mcp" searchCommand="jira_search" {...props} />;
}
