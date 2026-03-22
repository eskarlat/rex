import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    name: z.string().min(1, 'name is required'),
    value: z.string(),
    domain: z.string().optional(),
    path: z.string().optional(),
    httpOnly: z.boolean().optional(),
    secure: z.boolean().optional(),
    sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
    expires: z.coerce.number().optional(),
  },
  handler: (ctx) => {
    const args = ['cookies', 'set', `${ctx.args.name}=${ctx.args.value}`];
    if (ctx.args.domain) args.push('--domain', ctx.args.domain);
    if (ctx.args.path) args.push('--path', ctx.args.path);
    if (ctx.args.httpOnly) args.push('--httpOnly');
    if (ctx.args.secure) args.push('--secure');
    if (ctx.args.sameSite) args.push('--sameSite', ctx.args.sameSite);
    if (ctx.args.expires !== undefined) args.push('--expires', String(ctx.args.expires));
    return browserCommand(ctx, args);
  },
});
