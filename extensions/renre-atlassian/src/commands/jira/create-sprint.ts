import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { boardIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  boardId: boardIdSchema,
  name: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

export default async function createSprint(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => {
    const sprint: Record<string, unknown> = {
      originBoardId: args.boardId,
      name: args.name,
    };
    if (args.startDate) sprint.startDate = args.startDate;
    if (args.endDate) sprint.endDate = args.endDate;
    if (args.goal) sprint.goal = args.goal;
    return jira.createSprint(sprint);
  });
}
