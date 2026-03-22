import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getDevInfo(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getDevelopmentInfo(
      args['issueId'] as string,
      args['applicationType'] as string | undefined,
      args['dataType'] as string | undefined,
    ),
  );
}
