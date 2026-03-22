import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    epicKey: z.string().min(1),
    issueKeys: z.array(z.string()).min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.linkToEpic(args.epicKey, args.issueKeys);
    return { success: true };
  }),
});
