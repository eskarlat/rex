import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function deleteAttachment(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const attachmentId = context.args['attachmentId'] as string;
    await confluence.deleteAttachment(attachmentId);
    return toOutput({ success: true, attachmentId });
  } catch (err) {
    return errorOutput(err);
  }
}
