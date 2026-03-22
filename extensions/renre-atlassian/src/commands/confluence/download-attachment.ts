import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  return confluenceCommand(context, async (confluence, args) => {
    const pageId = args['pageId'] as string;
    const filename = args['filename'] as string;
    const res = await confluence.downloadAttachment(pageId, filename);
    const text = await res.text();
    return { pageId, filename, content: text };
  });
}
