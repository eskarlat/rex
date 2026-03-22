import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { jsonOutputSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    jql: z.string().min(1, 'JQL query is required'),
    fields: z.array(z.string()).optional(),
    startAt: z.coerce.number().int().min(0).default(0),
    maxResults: z.coerce.number().int().min(1).max(100).default(50),
    ...jsonOutputSchema,
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.search(args.jql, args.startAt, args.maxResults, args.fields),),
});
