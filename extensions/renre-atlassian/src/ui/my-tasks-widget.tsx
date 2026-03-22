import { MyTasksWidget as BaseMyTasksWidget } from '@renre-kit/extension-sdk/components';
import type { MyTasksWidgetProps } from '@renre-kit/extension-sdk/components';

export default function MyTasksWidget(props: MyTasksWidgetProps) {
  return <BaseMyTasksWidget defaultExtensionName="renre-atlassian" searchCommand="jira-search" {...props} />;
}
