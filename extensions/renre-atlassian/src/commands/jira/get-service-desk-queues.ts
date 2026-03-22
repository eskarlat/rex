import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getServiceDeskQueues(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.getServiceDeskQueues(context.args['serviceDeskId'] as number);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
