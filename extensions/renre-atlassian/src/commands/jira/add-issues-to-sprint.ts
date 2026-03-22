import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addIssuesToSprint(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const sprintId = args['sprintId'] as number;
    const issueKeys = args['issueKeys'] as string[];
    await jira.addIssuesToSprint(sprintId, issueKeys);
    return { success: true, sprintId, issueKeys };
  });
}
