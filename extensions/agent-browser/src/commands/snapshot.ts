import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    interactive: z.boolean().default(false),
    compact: z.boolean().default(false),
  },
  handler: (ctx) => {
    const args = ['snapshot'];
    if (ctx.args.interactive) args.push('-i');
    if (ctx.args.compact) args.push('-c');
    return browserCommand(ctx, args);
  },
});
