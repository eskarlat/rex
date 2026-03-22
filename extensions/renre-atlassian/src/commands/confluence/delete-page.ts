import { defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
  },
  handler: (ctx) =>
    confluenceCommand(ctx, async (confluence, args) => {
      await confluence.deletePage(args.pageId);
      return { success: true, pageId: args.pageId };
    }),
});
