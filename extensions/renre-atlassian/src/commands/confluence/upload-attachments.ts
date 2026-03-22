import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    files: z.array(z.object({ filename: z.string().min(1), content: z.string() })).min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, async (confluence, args) => {
      const results = [];
      for (const f of args.files) {
        results.push(await confluence.uploadAttachment(args.pageId, f.filename, f.content));
      }
      return results;
    }),
});
