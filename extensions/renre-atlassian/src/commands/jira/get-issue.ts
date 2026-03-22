import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    expand: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getIssue(args.issueKey, args.expand),),
});
