import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    clear: z.boolean().default(false),
  },
  handler: (ctx) => {
    const args = ['console'];
    if (ctx.args.clear) args.push('--clear');
    return browserCommand(ctx, args);
  },
});
