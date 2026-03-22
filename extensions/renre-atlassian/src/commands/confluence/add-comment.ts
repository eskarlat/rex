import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    body: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) => confluence.addComment(args.pageId, args.body)),
});
