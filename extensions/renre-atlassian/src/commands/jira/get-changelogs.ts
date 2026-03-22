import { jiraCommand, paginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getChangelogs(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const { startAt, maxResults } = paginationArgs(args, { startAt: 0, maxResults: 100 });
    return jira.getChangelogs(args['issueKey'] as string, startAt, maxResults);
  });
}
