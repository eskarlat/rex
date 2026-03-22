import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    version: z.coerce.number().int().positive(),
    title: z.string().min(1),
    body: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) =>
      confluence.updatePage(args.pageId, {
        type: 'page',
        title: args.title,
        body: { storage: { value: args.body, representation: 'storage' } },
        version: { number: args.version + 1 },
      }),
    ),
});
