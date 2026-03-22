import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getIssueWatchers(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => jira.getWatchers(args['issueKey'] as string));
}
