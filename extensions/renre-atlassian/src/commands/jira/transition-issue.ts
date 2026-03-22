import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    transitionId: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.transitionIssue(args.issueKey, args.transitionId);
    return { success: true, issueKey: args.issueKey, transitionId: args.transitionId };
  }),
});
