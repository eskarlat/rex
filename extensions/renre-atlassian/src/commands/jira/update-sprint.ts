import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updateSprint(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const sprintId = context.args['sprintId'] as number;
    const name = context.args['name'] as string | undefined;
    const state = context.args['state'] as string | undefined;
    const startDate = context.args['startDate'] as string | undefined;
    const endDate = context.args['endDate'] as string | undefined;
    const goal = context.args['goal'] as string | undefined;

    const update: Record<string, unknown> = {};
    if (name) update.name = name;
    if (state) update.state = state;
    if (startDate) update.startDate = startDate;
    if (endDate) update.endDate = endDate;
    if (goal) update.goal = goal;

    const data = await jira.updateSprint(sprintId, update);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
