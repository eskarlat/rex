import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    url: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['cookies', 'clear'];
    if (ctx.args.url) args.push('--url', ctx.args.url);
    return browserCommand(ctx, args);
  },
});
