import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function removeIssueLink(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const linkId = args['linkId'] as string;
    await jira.removeIssueLink(linkId);
    return { success: true, linkId };
  });
}
