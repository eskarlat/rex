import { defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.deleteIssue(args.issueKey);
    return { success: true, issueKey: args.issueKey };
  }),
});
