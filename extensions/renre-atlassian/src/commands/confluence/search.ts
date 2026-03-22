import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function search(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const data = await confluence.search(
      context.args['cql'] as string,
      (context.args['limit'] as number | undefined) ?? 25,
      (context.args['start'] as number | undefined) ?? 0,
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
