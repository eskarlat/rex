import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import type { ExecutionContext } from '../../../core/types/context.types.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

export type CommandHandler = (context: ExecutionContext) => Promise<unknown>;

export async function loadCommandHandler(
  extensionDir: string,
  commandFile: string,
): Promise<CommandHandler> {
  const fullPath = join(extensionDir, commandFile);

  if (!existsSync(fullPath)) {
    throw new ExtensionError(
      '',
      ErrorCode.COMMAND_HANDLER_NOT_FOUND,
      `Command handler not found: ${fullPath}`,
    );
  }

  let mod: Record<string, unknown>;
  try {
    const fileUrl = pathToFileURL(fullPath).href;
    mod = (await import(fileUrl)) as Record<string, unknown>;
  } catch (err) {
    throw new ExtensionError(
      '',
      ErrorCode.COMMAND_HANDLER_NOT_FOUND,
      `Failed to load command handler: ${fullPath}`,
      err as Error,
    );
  }

  const handler = (mod.default ?? mod.execute) as CommandHandler | undefined;

  if (typeof handler !== 'function') {
    throw new ExtensionError(
      '',
      ErrorCode.COMMAND_HANDLER_NOT_FOUND,
      `Command handler at ${fullPath} does not export a default function or execute function`,
    );
  }

  return handler;
}

export async function executeCommand(
  handler: CommandHandler,
  context: ExecutionContext,
): Promise<unknown> {
  try {
    return await handler(context);
  } catch (err) {
    throw new ExtensionError(
      context.projectName,
      ErrorCode.COMMAND_EXECUTION_FAILED,
      `Command execution failed: ${(err as Error).message}`,
      err as Error,
    );
  }
}
