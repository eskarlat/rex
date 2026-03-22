import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { boardIdSchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    boardId: boardIdSchema,
    name: z.string().min(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    goal: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) => {
    const sprint: Record<string, unknown> = {
      originBoardId: args.boardId,
      name: args.name,
    };
    if (args.startDate) sprint.startDate = args.startDate;
    if (args.endDate) sprint.endDate = args.endDate;
    if (args.goal) sprint.goal = args.goal;
    return jira.createSprint(sprint);
  }),
});
