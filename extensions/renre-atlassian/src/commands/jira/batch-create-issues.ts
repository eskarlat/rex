import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    issues: z.array(z.object({ fields: z.record(z.unknown()) })).min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) => jira.bulkCreateIssues(args.issues)),
});
