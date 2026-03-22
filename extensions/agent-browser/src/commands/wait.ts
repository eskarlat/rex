import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    target: z.string().min(1, 'target is required (selector or milliseconds)'),
  },
  handler: (ctx) => browserCommand(ctx, ['wait', ctx.args.target]),
});
