import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    parentCommentId: z.string().min(1),
    body: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) =>
      confluence.replyToComment(args.pageId, args.parentCommentId, args.body),
    ),
});
