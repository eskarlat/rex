import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addLabel(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const labelNames = context.args['labels'] as string[];
    const labels = labelNames.map((name) => ({ name }));
    const data = await confluence.addLabel(pageId, labels);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
