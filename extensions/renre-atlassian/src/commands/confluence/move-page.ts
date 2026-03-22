import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function movePage(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const targetAncestorId = context.args['targetAncestorId'] as string;
    const currentVersion = context.args['currentVersion'] as number;
    const data = await confluence.movePage(pageId, targetAncestorId, currentVersion);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
