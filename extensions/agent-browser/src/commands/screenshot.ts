import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    path: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['screenshot'];
    if (ctx.args.path) args.push(ctx.args.path);
    return browserCommand(ctx, args);
  },
});
