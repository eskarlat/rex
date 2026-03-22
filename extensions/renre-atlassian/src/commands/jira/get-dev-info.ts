import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    issueId: z.string().min(1),
    applicationType: z.string().optional(),
    dataType: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getDevelopmentInfo(args.issueId, args.applicationType, args.dataType),),
});
