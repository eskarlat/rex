import { jiraCommand, paginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getSprintsFromBoard(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const { startAt, maxResults } = paginationArgs(args);
    return jira.getSprintsFromBoard(args['boardId'] as number, startAt, maxResults);
  });
}
