import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  pageId: pageIdSchema,
  version: z.coerce.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export default async function updatePage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.updatePage(args.pageId, {
      type: 'page',
      title: args.title,
      body: { storage: { value: args.body, representation: 'storage' } },
      version: { number: args.version + 1 },
    }),
  );
}
