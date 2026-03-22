import { jiraCommand, paginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getSprintIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const { startAt, maxResults } = paginationArgs(args);
    return jira.getSprintIssues(args['sprintId'] as number, startAt, maxResults);
  });
}
