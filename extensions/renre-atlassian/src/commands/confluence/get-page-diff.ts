import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPageDiff(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const fromVersion = context.args['fromVersion'] as number;
    const toVersion = context.args['toVersion'] as number;

    const [fromPage, toPage] = await Promise.all([
      confluence.getPageVersion(pageId, fromVersion),
      confluence.getPageVersion(pageId, toVersion),
    ]);

    const fromRecord = fromPage as Record<string, unknown>;
    const toRecord = toPage as Record<string, unknown>;

    const fromBodyStorage = fromRecord['body'] as Record<string, unknown> | undefined;
    const fromStorage = fromBodyStorage?.['storage'] as Record<string, unknown> | undefined;
    const fromBody = (fromStorage?.['value'] as string) ?? '';

    const toBodyStorage = toRecord['body'] as Record<string, unknown> | undefined;
    const toStorage = toBodyStorage?.['storage'] as Record<string, unknown> | undefined;
    const toBody = (toStorage?.['value'] as string) ?? '';

    return toOutput({ pageId, fromVersion, toVersion, from: fromBody, to: toBody });
  } catch (err) {
    return errorOutput(err);
  }
}
