import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getProjectVersions(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getProjectVersions(args['projectKey'] as string),
  );
}
