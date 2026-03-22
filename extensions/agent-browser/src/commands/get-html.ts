import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    ref: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['get', 'html'];
    if (ctx.args.ref) args.push(ctx.args.ref);
    return browserCommand(ctx, args);
  },
});
