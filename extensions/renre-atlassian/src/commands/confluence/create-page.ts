import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createPage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const page: Record<string, unknown> = {
      type: 'page',
      title: args['title'] as string,
      space: { key: args['spaceKey'] as string },
      body: { storage: { value: args['body'] as string, representation: 'storage' } },
    };
    if (args['parentId']) page['ancestors'] = [{ id: args['parentId'] }];
    return confluence.createPage(page);
  });
}
