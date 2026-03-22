import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ attachmentId: z.string().min(1) });

export default async function deleteAttachment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, async (confluence, args) => {
    await confluence.deleteAttachment(args.attachmentId);
    return { success: true, attachmentId: args.attachmentId };
  });
}
