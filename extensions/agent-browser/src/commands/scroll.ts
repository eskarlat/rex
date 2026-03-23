import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';
import { scrollDirectionSchema } from '../shared/schemas.js';

export default defineCommand({
  args: {
    direction: scrollDirectionSchema,
    pixels: z.coerce.number().int().positive().optional(),
  },
  handler: (ctx) => {
    const args = ['scroll', ctx.args.direction];
    if (ctx.args.pixels !== undefined) args.push(String(ctx.args.pixels));
    return browserCommand(ctx, args);
  },
});
