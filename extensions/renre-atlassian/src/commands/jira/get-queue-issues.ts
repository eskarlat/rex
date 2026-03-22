import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getQueueIssues(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.getQueueIssues(
      context.args['serviceDeskId'] as number,
      context.args['queueId'] as number,
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
