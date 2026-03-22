import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  pageId: pageIdSchema,
  fromVersion: z.coerce.number().int().positive(),
  toVersion: z.coerce.number().int().positive(),
});

function extractStorageValue(page: unknown): string {
  const record = page as Record<string, unknown>;
  const bodyStorage = record['body'] as Record<string, unknown> | undefined;
  const storage = bodyStorage?.['storage'] as Record<string, unknown> | undefined;
  return (storage?.['value'] as string) ?? '';
}

export default async function getPageDiff(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, async (confluence, args) => {
    const [fromPage, toPage] = await Promise.all([
      confluence.getPageVersion(args.pageId, args.fromVersion),
      confluence.getPageVersion(args.pageId, args.toVersion),
    ]);
    return {
      pageId: args.pageId,
      fromVersion: args.fromVersion,
      toVersion: args.toVersion,
      from: extractStorageValue(fromPage),
      to: extractStorageValue(toPage),
    };
  });
}
