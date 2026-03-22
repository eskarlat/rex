import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function deletePage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, async (confluence, args) => {
    const pageId = args['pageId'] as string;
    await confluence.deletePage(pageId);
    return { success: true, pageId };
  });
}
