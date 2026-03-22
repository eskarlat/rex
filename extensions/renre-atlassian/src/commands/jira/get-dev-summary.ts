import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getDevSummary(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getDevelopmentSummary(args['issueId'] as string),
  );
}
