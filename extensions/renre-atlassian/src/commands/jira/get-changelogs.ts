import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    startAt: z.coerce.number().int().min(0).default(0),
    maxResults: z.coerce.number().int().min(1).max(100).default(100),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getChangelogs(args.issueKey, args.startAt, args.maxResults),),
});
