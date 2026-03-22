import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function deleteAttachment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, async (confluence, args) => {
    const attachmentId = args['attachmentId'] as string;
    await confluence.deleteAttachment(attachmentId);
    return { success: true, attachmentId };
  });
}
