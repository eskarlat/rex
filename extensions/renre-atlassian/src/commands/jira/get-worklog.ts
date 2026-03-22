import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getWorklog(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => jira.getWorklog(args['issueKey'] as string));
}
