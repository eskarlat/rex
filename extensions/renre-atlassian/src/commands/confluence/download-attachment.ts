import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const filename = context.args['filename'] as string;
    const res = await confluence.downloadAttachment(pageId, filename);
    const text = await (res as Response).text();
    return toOutput({ pageId, filename, content: text });
  } catch (err) {
    return errorOutput(err);
  }
}
