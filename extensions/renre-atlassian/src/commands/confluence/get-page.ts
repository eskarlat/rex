import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPage(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const data = await confluence.getPage(
      context.args['pageId'] as string,
      (context.args['expand'] as string | undefined) ?? 'body.storage,version',
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
