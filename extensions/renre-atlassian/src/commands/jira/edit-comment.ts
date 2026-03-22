import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    commentId: z.string().min(1),
    body: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.editComment(args.issueKey, args.commentId, buildAdfBody(args.body)),),
});
