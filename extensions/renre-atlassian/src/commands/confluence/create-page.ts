import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createPage(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const title = context.args['title'] as string;
    const spaceKey = context.args['spaceKey'] as string;
    const body = context.args['body'] as string;
    const parentId = context.args['parentId'] as string | undefined;

    const page: Record<string, unknown> = {
      type: 'page',
      title,
      space: { key: spaceKey },
      body: { storage: { value: body, representation: 'storage' } },
    };

    if (parentId) {
      page['ancestors'] = [{ id: parentId }];
    }

    const data = await confluence.createPage(page);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
