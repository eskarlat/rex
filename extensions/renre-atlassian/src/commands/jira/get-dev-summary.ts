import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    issueId: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getDevelopmentSummary(args.issueId),),
});
