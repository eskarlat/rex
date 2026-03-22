import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import type { ZodType, ZodError } from 'zod';

import type { ExecutionContext } from '../../../core/types/context.types.js';
import { ExtensionError, ErrorCode } from '../../../core/errors/extension-error.js';

export type CommandHandler = (context: ExecutionContext) => unknown;

export interface LoadedCommand {
  handler: CommandHandler;
  argsSchema?: ZodType;
}

export async function loadCommandHandler(
  extensionDir: string,
  commandFile: string,
): Promise<LoadedCommand> {
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

  const defaultExport = mod.default as Record<string, unknown> | undefined;

  if (
    !defaultExport ||
    typeof defaultExport !== 'object' ||
    typeof defaultExport.handler !== 'function'
  ) {
    throw new ExtensionError(
      '',
      ErrorCode.COMMAND_HANDLER_NOT_FOUND,
      `Command handler at ${fullPath} must use defineCommand() from @renre-kit/extension-sdk/node`,
    );
  }

  return {
    handler: defaultExport.handler as CommandHandler,
    argsSchema: defaultExport.argsSchema as ZodType | undefined,
  };
}

export function formatValidationErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `--${issue.path.join('.')}` : 'input';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

export function validateArgs(
  schema: ZodType,
  args: Record<string, unknown>,
): Record<string, unknown> {
  const result = schema.safeParse(args) as { success: boolean; data?: Record<string, unknown>; error?: ZodError };
  if (!result.success) {
    throw new ExtensionError(
      '',
      ErrorCode.ARGS_VALIDATION_FAILED,
      `Invalid arguments: ${formatValidationErrors(result.error!)}`,
    );
  }
  return result.data!;
}

export async function executeCommand(
  loaded: LoadedCommand,
  context: ExecutionContext,
): Promise<unknown> {
  const { handler, argsSchema } = loaded;

  if (argsSchema) {
    context = { ...context, args: validateArgs(argsSchema, context.args) };
  }

  try {
    return await handler(context);
  } catch (err) {
    if (err instanceof ExtensionError && err.code === ErrorCode.ARGS_VALIDATION_FAILED) {
      throw err;
    }
    throw new ExtensionError(
      context.projectName,
      ErrorCode.COMMAND_EXECUTION_FAILED,
      `Command execution failed: ${(err as Error).message}`,
      err as Error,
    );
  }
}
