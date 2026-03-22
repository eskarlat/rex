import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    linkId: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.removeIssueLink(args.linkId);
    return { success: true, linkId: args.linkId };
  }),
});
