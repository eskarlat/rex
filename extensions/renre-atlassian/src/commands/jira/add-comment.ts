import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    body: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.addComment(args.issueKey, buildAdfBody(args.body)),),
});
