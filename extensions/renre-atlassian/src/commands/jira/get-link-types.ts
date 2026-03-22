import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getLinkTypes(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.getLinkTypes();
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
