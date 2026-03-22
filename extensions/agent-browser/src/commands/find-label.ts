import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    label: z.string().min(1, 'label is required'),
    action: z.enum(['click', 'fill', 'hover', 'focus', 'check', 'uncheck']),
    text: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['find', 'label', ctx.args.label, ctx.args.action];
    if (ctx.args.text) args.push(ctx.args.text);
    return browserCommand(ctx, args);
  },
});
