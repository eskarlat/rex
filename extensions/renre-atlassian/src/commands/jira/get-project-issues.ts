import { jiraCommand, paginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getProjectIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const { startAt, maxResults } = paginationArgs(args);
    return jira.search(
      `project = ${args['projectKey'] as string} ORDER BY updated DESC`,
      startAt,
      maxResults,
    );
  });
}
