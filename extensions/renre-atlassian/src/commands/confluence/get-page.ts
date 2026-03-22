import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.getPage(
      args['pageId'] as string,
      (args['expand'] as string | undefined) ?? 'body.storage,version',
    ),
  );
}
