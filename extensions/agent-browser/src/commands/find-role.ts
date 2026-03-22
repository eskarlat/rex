import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    role: z.string().min(1, 'role is required'),
    action: z.enum(['click', 'fill', 'hover', 'focus', 'check', 'uncheck']),
    name: z.string().optional(),
    text: z.string().optional(),
  },
  handler: (ctx) => {
    const args = ['find', 'role', ctx.args.role, ctx.args.action];
    if (ctx.args.name) args.push('--name', ctx.args.name);
    if (ctx.args.text) args.push(ctx.args.text);
    return browserCommand(ctx, args);
  },
});
