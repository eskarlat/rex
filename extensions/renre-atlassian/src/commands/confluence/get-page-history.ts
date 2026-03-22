import { defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) => confluence.getPageHistory(args.pageId)),
});
