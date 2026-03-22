import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { sprintIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    sprintId: sprintIdSchema,
    issueKeys: z.array(z.string()).min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.addIssuesToSprint(args.sprintId, args.issueKeys);
    return { success: true, sprintId: args.sprintId, issueKeys: args.issueKeys };
  }),
});
