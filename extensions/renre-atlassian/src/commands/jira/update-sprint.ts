import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updateSprint(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const sprintId = args['sprintId'] as number;
    const update: Record<string, unknown> = {};
    if (args['name']) update.name = args['name'];
    if (args['state']) update.state = args['state'];
    if (args['startDate']) update.startDate = args['startDate'];
    if (args['endDate']) update.endDate = args['endDate'];
    if (args['goal']) update.goal = args['goal'];
    return jira.updateSprint(sprintId, update);
  });
}
