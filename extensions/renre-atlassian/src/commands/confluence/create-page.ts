import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    title: z.string().min(1),
    spaceKey: z.string().min(1),
    body: z.string().min(1),
    parentId: z.string().optional(),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) => {
      const page: Record<string, unknown> = {
        type: 'page',
        title: args.title,
        space: { key: args.spaceKey },
        body: { storage: { value: args.body, representation: 'storage' } },
      };
      if (args.parentId) page['ancestors'] = [{ id: args.parentId }];
      return confluence.createPage(page);
    }),
});
