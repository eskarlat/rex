import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  args: {
    serviceDeskId: z.coerce.number().int().positive(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getServiceDeskQueues(args.serviceDeskId),),
});
