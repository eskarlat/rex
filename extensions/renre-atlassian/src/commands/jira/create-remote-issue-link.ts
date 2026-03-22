import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    url: z.string().url(),
    title: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.createRemoteIssueLink(args.issueKey, {
      object: { url: args.url, title: args.title },
    }),),
});
