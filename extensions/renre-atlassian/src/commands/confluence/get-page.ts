import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    expand: z.string().default('body.storage,version'),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) => confluence.getPage(args.pageId, args.expand)),
});
