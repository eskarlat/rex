import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getLabels(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.getLabels(args['pageId'] as string),
  );
}
