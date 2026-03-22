import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    projectKey: projectKeySchema,
    startAt: z.coerce.number().int().min(0).default(0),
    maxResults: z.coerce.number().int().min(1).max(100).default(50),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.search(
      `project = ${args.projectKey} ORDER BY updated DESC`,
      args.startAt,
      args.maxResults,
    ),),
});
