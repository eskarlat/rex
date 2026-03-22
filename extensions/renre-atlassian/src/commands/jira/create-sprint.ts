import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createSprint(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const boardId = context.args['boardId'] as number;
    const name = context.args['name'] as string;
    const startDate = context.args['startDate'] as string | undefined;
    const endDate = context.args['endDate'] as string | undefined;
    const goal = context.args['goal'] as string | undefined;

    const sprint: Record<string, unknown> = { originBoardId: boardId, name };
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (goal) sprint.goal = goal;

    const data = await jira.createSprint(sprint);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
