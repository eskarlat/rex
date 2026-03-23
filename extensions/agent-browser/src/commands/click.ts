import { defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';
import { refSchema } from '../shared/schemas.js';

export default defineCommand({
  args: {
    ref: refSchema,
  },
  handler: (ctx) => browserCommand(ctx, ['click', ctx.args.ref]),
});
