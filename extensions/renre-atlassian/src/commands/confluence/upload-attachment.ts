import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function uploadAttachment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.uploadAttachment(
      args['pageId'] as string,
      args['filename'] as string,
      args['content'] as string,
    ),
  );
}
