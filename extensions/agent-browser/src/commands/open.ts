import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    url: z.string().min(1, 'url is required'),
  },
  handler: (ctx) => browserCommand(ctx, ['open', ctx.args.url]),
});
