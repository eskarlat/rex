import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPageViews(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const fromDate = context.args['fromDate'] as string | undefined;
    const data = await confluence.getPageViews(pageId, fromDate);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
