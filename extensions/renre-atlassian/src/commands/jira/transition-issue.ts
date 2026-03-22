import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function transitionIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const issueKey = args['issueKey'] as string;
    const transitionId = args['transitionId'] as string;
    await jira.transitionIssue(issueKey, transitionId);
    return { success: true, issueKey, transitionId };
  });
}
