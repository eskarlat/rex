import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    path: z.string().min(1, 'path is required'),
  },
  handler: (ctx) => browserCommand(ctx, ['pdf', ctx.args.path]),
});
