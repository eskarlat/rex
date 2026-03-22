import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function uploadAttachments(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const files = context.args['files'] as Array<{ filename: string; content: string }>;
    const results = [];

    for (const f of files) {
      const result = await confluence.uploadAttachment(pageId, f.filename, f.content);
      results.push(result);
    }

    return toOutput(results);
  } catch (err) {
    return errorOutput(err);
  }
}
