import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    ref: z.string().min(1, 'ref is required'),
  },
  handler: (ctx) => browserCommand(ctx, ['highlight', ctx.args.ref]),
});
