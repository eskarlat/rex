import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ pageId: pageIdSchema, body: z.string().min(1) });

export default async function addComment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.addComment(args.pageId, args.body),
  );
}
