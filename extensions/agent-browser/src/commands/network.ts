import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    filter: z.string().optional(),
    clear: z.boolean().default(false),
  },
  handler: (ctx) => {
    const args = ['network', 'requests'];
    if (ctx.args.filter) args.push('--filter', ctx.args.filter);
    if (ctx.args.clear) args.push('--clear');
    return browserCommand(ctx, args);
  },
});
