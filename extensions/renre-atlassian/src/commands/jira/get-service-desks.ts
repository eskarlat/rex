import { defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';

export default defineCommand({
  handler: (ctx) =>
    jiraCommand(ctx, (jira) => jira.getServiceDesks()),
});
