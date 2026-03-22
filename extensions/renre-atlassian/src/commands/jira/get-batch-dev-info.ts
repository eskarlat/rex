import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getBatchDevInfo(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getBatchDevelopmentInfo(
      args['issueIds'] as string[],
      args['applicationType'] as string | undefined,
      args['dataType'] as string | undefined,
    ),
  );
}
