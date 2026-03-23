import { defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';
import { urlSchema } from '../shared/schemas.js';

export default defineCommand({
  args: {
    url: urlSchema,
  },
  handler: (ctx) => browserCommand(ctx, ['open', ctx.args.url]),
});
