import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';

function extractStorageValue(page: unknown): string {
  const record = page as Record<string, unknown>;
  const bodyStorage = record['body'] as Record<string, unknown> | undefined;
  const storage = bodyStorage?.['storage'] as Record<string, unknown> | undefined;
  return (storage?.['value'] as string) ?? '';
}

export default defineCommand({
  args: {
    pageId: pageIdSchema,
    fromVersion: z.coerce.number().int().positive(),
    toVersion: z.coerce.number().int().positive(),
  },
  handler: (ctx) =>
    confluenceCommand(ctx, async (confluence, args) => {
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
    }),
});
