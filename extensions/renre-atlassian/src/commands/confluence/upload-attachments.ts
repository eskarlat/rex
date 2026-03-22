import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  pageId: pageIdSchema,
  files: z.array(z.object({ filename: z.string().min(1), content: z.string() })).min(1),
});

export default async function uploadAttachments(
  context: ExecutionContext,
): Promise<CommandResult> {
  return confluenceCommand(context, schema, async (confluence, args) => {
    const results = [];
    for (const f of args.files) {
      results.push(await confluence.uploadAttachment(args.pageId, f.filename, f.content));
    }
    return results;
  });
}
