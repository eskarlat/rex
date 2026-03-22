import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    issueIds: z.array(z.string()).min(1),
    applicationType: z.string().optional(),
    dataType: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getBatchDevelopmentInfo(args.issueIds, args.applicationType, args.dataType),),
});
