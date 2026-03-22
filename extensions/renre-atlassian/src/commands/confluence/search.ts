import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    cql: z.string().min(1, 'CQL query is required'),
    start: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) =>
      confluence.search(args.cql, args.limit, args.start),
    ),
});
