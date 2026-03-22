import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    ref: z.string().min(1, 'ref is required (e.g. @e1 or CSS selector)'),
  },
  handler: (ctx) => browserCommand(ctx, ['click', ctx.args.ref]),
});
