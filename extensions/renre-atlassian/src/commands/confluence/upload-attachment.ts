import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function uploadAttachment(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const filename = context.args['filename'] as string;
    const content = context.args['content'] as string;
    const data = await confluence.uploadAttachment(pageId, filename, content);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
