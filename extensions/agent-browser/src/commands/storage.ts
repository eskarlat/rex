import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    type: z.enum(['local', 'session']),
    action: z.enum(['get', 'set', 'clear']).default('get'),
    key: z.string().optional(),
    value: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['storage', ctx.args.type];

    if (ctx.args.action === 'clear') {
      args.push('clear');
    } else if (ctx.args.action === 'set' && ctx.args.key) {
      args.push('set', ctx.args.key, ctx.args.value ?? '');
    } else if (ctx.args.key) {
      args.push('get', ctx.args.key);
    }

    return browserCommand(ctx, args);
  },
});
