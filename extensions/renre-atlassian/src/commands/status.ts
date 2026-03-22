import { defineCommand } from '@renre-kit/extension-sdk/node';

import { createClients } from '../shared/client.js';
import { toOutput, errorOutput } from '../shared/formatters.js';

export default defineCommand({
  handler: async (ctx) => {
    try {
      const { jira } = createClients(ctx);
      const user = await jira.getMyself();
      return toOutput({
        connected: true,
        user,
        domain: ctx.config['domain'],
        jiraCommands: 50,
        confluenceCommands: 23,
        totalCommands: 75,
      });
    } catch (err) {
      return errorOutput(err);
    }
  },
});
