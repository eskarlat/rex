import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    attachmentId: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    const res = await jira.downloadAttachment(args.attachmentId);
    const text = await res.text();
    return { attachmentId: args.attachmentId, content: text };
  }),
});
