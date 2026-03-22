import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

function extractStorageValue(page: unknown): string {
  const record = page as Record<string, unknown>;
  const bodyStorage = record['body'] as Record<string, unknown> | undefined;
  const storage = bodyStorage?.['storage'] as Record<string, unknown> | undefined;
  return (storage?.['value'] as string) ?? '';
}

export default async function getPageDiff(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, async (confluence, args) => {
    const pageId = args['pageId'] as string;
    const fromVersion = args['fromVersion'] as number;
    const toVersion = args['toVersion'] as number;
    const [fromPage, toPage] = await Promise.all([
      confluence.getPageVersion(pageId, fromVersion),
      confluence.getPageVersion(pageId, toVersion),
    ]);
    return { pageId, fromVersion, toVersion, from: extractStorageValue(fromPage), to: extractStorageValue(toPage) };
  });
}
