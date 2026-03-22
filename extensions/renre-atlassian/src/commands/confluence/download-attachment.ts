import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    filename: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, async (confluence, args) => {
      const res = await confluence.downloadAttachment(args.pageId, args.filename);
      const text = await res.text();
      return { pageId: args.pageId, filename: args.filename, content: text };
    }),
});
