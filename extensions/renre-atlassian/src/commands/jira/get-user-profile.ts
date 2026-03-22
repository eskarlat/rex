import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    accountId: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    args.accountId ? jira.getUser(args.accountId) : jira.getMyself(),),
});
