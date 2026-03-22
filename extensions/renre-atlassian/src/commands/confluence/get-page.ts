import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  pageId: pageIdSchema,
  expand: z.string().default('body.storage,version'),
});

export default async function getPage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.getPage(args.pageId, args.expand),
  );
}
