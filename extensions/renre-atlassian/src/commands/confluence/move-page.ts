import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function movePage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.movePage(
      args['pageId'] as string,
      args['targetAncestorId'] as string,
      args['currentVersion'] as number,
    ),
  );
}
