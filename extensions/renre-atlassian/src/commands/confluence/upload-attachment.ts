import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  pageId: pageIdSchema,
  filename: z.string().min(1),
  content: z.string().min(1),
});

export default async function uploadAttachment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.uploadAttachment(args.pageId, args.filename, args.content),
  );
}
