import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';
import { refSchema } from '../shared/schemas.js';

export default defineCommand({
  args: {
    ref: refSchema,
    text: z.string(),
  },
  handler: (ctx) => browserCommand(ctx, ['fill', ctx.args.ref, ctx.args.text]),
});
