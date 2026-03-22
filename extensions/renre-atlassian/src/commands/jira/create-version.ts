import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    projectKey: projectKeySchema,
    name: z.string().min(1),
    description: z.string().optional(),
    releaseDate: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) => {
    const version: Record<string, unknown> = {
      project: args.projectKey,
      name: args.name,
    };
    if (args.description) version.description = args.description;
    if (args.releaseDate) version.releaseDate = args.releaseDate;
    return jira.createVersion(version);
  }),
});
