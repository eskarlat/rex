import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    attachmentId: z.string().min(1),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, async (confluence, args) => {
      await confluence.deleteAttachment(args.attachmentId);
      return { success: true, attachmentId: args.attachmentId };
    }),
});
