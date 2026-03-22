import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updatePage(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const title = context.args['title'] as string;
    const body = context.args['body'] as string;
    const version = context.args['version'] as number;

    const page = {
      type: 'page',
      title,
      body: { storage: { value: body, representation: 'storage' } },
      version: { number: version + 1 },
    };

    const data = await confluence.updatePage(pageId, page);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
