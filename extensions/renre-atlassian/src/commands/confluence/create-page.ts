import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  title: z.string().min(1),
  spaceKey: z.string().min(1),
  body: z.string().min(1),
  parentId: z.string().optional(),
});

export default async function createPage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) => {
    const page: Record<string, unknown> = {
      type: 'page',
      title: args.title,
      space: { key: args.spaceKey },
      body: { storage: { value: args.body, representation: 'storage' } },
    };
    if (args.parentId) page['ancestors'] = [{ id: args.parentId }];
    return confluence.createPage(page);
  });
}
