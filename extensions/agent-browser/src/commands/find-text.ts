import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    text: z.string().min(1, 'text is required'),
    action: z.enum(['click', 'fill', 'hover', 'focus', 'check', 'uncheck']),
  },
  handler: (ctx) => browserCommand(ctx, ['find', 'text', ctx.args.text, ctx.args.action]),
});
