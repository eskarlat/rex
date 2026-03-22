import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updatePage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const version = args['version'] as number;
    return confluence.updatePage(args['pageId'] as string, {
      type: 'page',
      title: args['title'] as string,
      body: { storage: { value: args['body'] as string, representation: 'storage' } },
      version: { number: version + 1 },
    });
  });
}
