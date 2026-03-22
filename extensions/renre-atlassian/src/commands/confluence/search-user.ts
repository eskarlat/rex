import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    query: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) => confluence.searchUser(args.query)),
});
