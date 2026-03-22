import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function downloadAllAttachments(
  context: ExecutionContext,
): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.getAttachments(args['pageId'] as string),
  );
}
