import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPageImages(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.getPageImages(args['pageId'] as string),
  );
}
