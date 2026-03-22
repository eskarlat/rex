import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updateIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const issueKey = args['issueKey'] as string;
    await jira.updateIssue(issueKey, args['fields'] as Record<string, unknown>);
    return { success: true, issueKey };
  });
}
