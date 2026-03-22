import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { sprintIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  sprintId: sprintIdSchema,
  name: z.string().optional(),
  state: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

export default async function updateSprint(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => {
    const update: Record<string, unknown> = {};
    if (args.name) update.name = args.name;
    if (args.state) update.state = args.state;
    if (args.startDate) update.startDate = args.startDate;
    if (args.endDate) update.endDate = args.endDate;
    if (args.goal) update.goal = args.goal;
    return jira.updateSprint(args.sprintId, update);
  });
}
