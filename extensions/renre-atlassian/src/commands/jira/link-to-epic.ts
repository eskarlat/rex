import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function linkToEpic(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    await jira.linkToEpic(args['epicKey'] as string, args['issueKeys'] as string[]);
    return { success: true };
  });
}
