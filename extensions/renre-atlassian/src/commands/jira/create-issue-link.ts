import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    typeName: z.string().min(1),
    inwardIssueKey: z.string().min(1),
    outwardIssueKey: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.createIssueLink({
      type: { name: args.typeName },
      inwardIssue: { key: args.inwardIssueKey },
      outwardIssue: { key: args.outwardIssueKey },
    });
    return { success: true };
  }),
});
