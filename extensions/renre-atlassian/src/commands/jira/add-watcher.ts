import { defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { accountIdSchema, issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    accountId: accountIdSchema,
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.addWatcher(args.issueKey, args.accountId);
    return { success: true };
  }),
});
