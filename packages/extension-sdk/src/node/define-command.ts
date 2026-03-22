import { z } from 'zod';
import type { ExecutionContext } from '@renre-kit/shared';

export { z };

/** Handler return type — sync or async. */
type MaybePromise<T> = T | Promise<T>;

/** Context with typed args inferred from the zod schema. */
export type TypedContext<TArgs extends Record<string, unknown> = Record<string, unknown>> = Omit<
  ExecutionContext,
  'args'
> & { args: TArgs };

/** Options for defineCommand when args schema is provided. */
export interface DefineCommandOptionsWithArgs<T extends z.ZodRawShape> {
  args: T;
  handler: (ctx: TypedContext<z.infer<z.ZodObject<T>>>) => MaybePromise<unknown>;
}

/** Options for defineCommand when no args schema is needed. */
export interface DefineCommandOptionsNoArgs {
  handler: (ctx: TypedContext) => MaybePromise<unknown>;
}

/** The object returned by defineCommand — detected by the CLI runtime. */
export interface DefinedCommand {
  handler: (ctx: ExecutionContext) => MaybePromise<unknown>;
  argsSchema?: z.ZodType;
}

/**
 * Define an extension command with typed args validation.
 *
 * @example
 * ```ts
 * import { z, defineCommand } from '@renre-kit/extension-sdk/node';
 *
 * export default defineCommand({
 *   args: { selector: z.string(), timeout: z.number().default(5000) },
 *   handler: async (ctx) => {
 *     ctx.args.selector; // string
 *     ctx.args.timeout;  // number
 *   },
 * });
 * ```
 */
export function defineCommand<T extends z.ZodRawShape>(
  options: DefineCommandOptionsWithArgs<T>,
): DefinedCommand;
export function defineCommand(options: DefineCommandOptionsNoArgs): DefinedCommand;
export function defineCommand<T extends z.ZodRawShape>(
  options: DefineCommandOptionsWithArgs<T> | DefineCommandOptionsNoArgs,
): DefinedCommand {
  const handler = options.handler as (ctx: ExecutionContext) => MaybePromise<unknown>;
  if ('args' in options && options.args !== undefined) {
    return { handler, argsSchema: z.object(options.args) };
  }
  return { handler };
}
