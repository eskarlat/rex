import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    fields: z.record(z.unknown()).refine(
    (obj) => Object.keys(obj).length > 0,
    'fields must not be empty',
    ),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.updateIssue(args.issueKey, args.fields);
    return { success: true, issueKey: args.issueKey };
  }),
});
