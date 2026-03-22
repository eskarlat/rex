import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addIssuesToSprint(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const sprintId = context.args['sprintId'] as number;
    const issueKeys = context.args['issueKeys'] as string[];
    await jira.addIssuesToSprint(sprintId, issueKeys);
    return toOutput({ success: true, sprintId, issueKeys });
  } catch (err) {
    return errorOutput(err);
  }
}
