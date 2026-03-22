import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addWatcher(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    await jira.addWatcher(args['issueKey'] as string, args['accountId'] as string);
    return { success: true };
  });
}
