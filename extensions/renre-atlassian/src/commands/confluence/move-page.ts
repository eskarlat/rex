import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    targetAncestorId: z.string().min(1),
    currentVersion: z.coerce.number().int().positive(),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, (confluence, args) =>
      confluence.movePage(args.pageId, args.targetAncestorId, args.currentVersion),
    ),
});
