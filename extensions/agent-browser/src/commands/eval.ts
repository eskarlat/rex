import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    code: z.string().min(1, 'code is required'),
  },
  handler: (ctx) => browserCommand(ctx, ['eval', ctx.args.code]),
});
