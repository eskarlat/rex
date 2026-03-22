import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  args: {
    baseline: z.string().min(1, 'baseline image path is required'),
  },
  handler: (ctx) => browserCommand(ctx, ['diff', 'screenshot', '--baseline', ctx.args.baseline]),
});
