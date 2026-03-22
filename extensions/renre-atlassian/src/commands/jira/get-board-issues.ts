import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { boardIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    boardId: boardIdSchema,
    startAt: z.coerce.number().int().min(0).default(0),
    maxResults: z.coerce.number().int().min(1).max(100).default(50),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getBoardIssues(args.boardId, args.startAt, args.maxResults),),
});
