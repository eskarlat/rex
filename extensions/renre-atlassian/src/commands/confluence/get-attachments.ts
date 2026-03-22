import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getAttachments(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const limit = (context.args['limit'] as number | undefined) ?? 25;
    const start = (context.args['start'] as number | undefined) ?? 0;
    const data = await confluence.getAttachments(pageId, limit, start);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
