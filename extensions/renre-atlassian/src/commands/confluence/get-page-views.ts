import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    fromDate: z.string().optional(),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) =>
      confluence.getPageViews(args.pageId, args.fromDate),
    ),
});
