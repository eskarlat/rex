import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPageHistory(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const data = await confluence.getPageHistory(pageId);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
