import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function deletePage(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    await confluence.deletePage(pageId);
    return toOutput({ success: true, pageId });
  } catch (err) {
    return errorOutput(err);
  }
}
