import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    projectKey: projectKeySchema,
    versions: z.array(z.record(z.unknown())).min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    const results = [];
    for (const v of args.versions) {
      results.push(await jira.createVersion({ project: args.projectKey, ...v }));
    }
    return results;
  }),
});
