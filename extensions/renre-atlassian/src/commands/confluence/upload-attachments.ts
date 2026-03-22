import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function uploadAttachments(
  context: ExecutionContext,
): Promise<CommandResult> {
  return confluenceCommand(context, async (confluence, args) => {
    const pageId = args['pageId'] as string;
    const files = args['files'] as Array<{ filename: string; content: string }>;
    const results = [];
    for (const f of files) {
      results.push(await confluence.uploadAttachment(pageId, f.filename, f.content));
    }
    return results;
  });
}
