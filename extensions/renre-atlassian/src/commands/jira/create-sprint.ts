import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createSprint(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const sprint: Record<string, unknown> = {
      originBoardId: args['boardId'] as number,
      name: args['name'] as string,
    };
    if (args['startDate']) sprint.startDate = args['startDate'];
    if (args['endDate']) sprint.endDate = args['endDate'];
    if (args['goal']) sprint.goal = args['goal'];
    return jira.createSprint(sprint);
  });
}
