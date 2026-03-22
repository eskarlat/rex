import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ pageId: pageIdSchema, filename: z.string().min(1) });

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  return confluenceCommand(context, schema, async (confluence, args) => {
    const res = await confluence.downloadAttachment(args.pageId, args.filename);
    const text = await res.text();
    return { pageId: args.pageId, filename: args.filename, content: text };
  });
}
