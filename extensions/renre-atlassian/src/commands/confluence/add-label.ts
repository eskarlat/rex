import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addLabel(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const labelNames = args['labels'] as string[];
    return confluence.addLabel(
      args['pageId'] as string,
      labelNames.map((name) => ({ name })),
    );
  });
}
