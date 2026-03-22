import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createIssueLink(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    await jira.createIssueLink({
      type: { name: args['typeName'] as string },
      inwardIssue: { key: args['inwardIssueKey'] as string },
      outwardIssue: { key: args['outwardIssueKey'] as string },
    });
    return { success: true };
  });
}
