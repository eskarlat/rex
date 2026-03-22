import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getProjectComponents(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getProjectComponents(args['projectKey'] as string),
  );
}
