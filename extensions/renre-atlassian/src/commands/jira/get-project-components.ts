import { defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    projectKey: projectKeySchema,
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getProjectComponents(args.projectKey),),
});
