import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { z } from 'zod';
import {
  loadCommandHandler,
  executeCommand,
  validateArgs,
  formatValidationErrors,
} from './standard-runtime.js';
import type { ExecutionContext } from '../../../core/types/context.types.js';
import { ErrorCode, ExtensionError } from '../../../core/errors/extension-error.js';

describe('standard-runtime', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'renre-kit-runtime-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const mockContext: ExecutionContext = {
    projectName: 'test-project',
    projectPath: '/tmp/test-project',
    config: { key: 'value' },
    args: { name: 'world' },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };

  function writeCommandFile(filename: string, code: string): string {
    const dir = join(tempDir, 'commands');
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, filename);
    writeFileSync(filePath, code);
    return filePath;
  }

  /** Helper: creates a defineCommand-style .mjs file (default export is { handler, argsSchema? }). */
  function writeDefineCommandFile(
    filename: string,
    opts: { argsCode?: string; handlerCode: string },
  ): void {
    const lines: string[] = [];
    if (opts.argsCode) {
      lines.push('import { z } from "zod";');
      lines.push(`const argsSchema = z.object(${opts.argsCode});`);
    }
    lines.push(`const handler = async function(ctx) { ${opts.handlerCode} };`);
    if (opts.argsCode) {
      lines.push('export default { handler, argsSchema };');
    } else {
      lines.push('export default { handler };');
    }
    writeCommandFile(filename, lines.join('\n'));
  }

  describe('loadCommandHandler', () => {
    it('should load a defineCommand-style handler (with argsSchema)', async () => {
      writeDefineCommandFile('with-schema.mjs', {
        argsCode: '{ selector: z.string() }',
        handlerCode: 'return ctx.args.selector;',
      });
      const loaded = await loadCommandHandler(tempDir, 'commands/with-schema.mjs');
      expect(typeof loaded.handler).toBe('function');
      expect(loaded.argsSchema).toBeDefined();
      // Verify the loaded schema actually works
      const parseResult = loaded.argsSchema!.safeParse({ selector: '.btn' });
      expect(parseResult.success).toBe(true);
      const failResult = loaded.argsSchema!.safeParse({});
      expect(failResult.success).toBe(false);
    });

    it('should load a defineCommand-style handler (without argsSchema)', async () => {
      writeDefineCommandFile('no-schema.mjs', {
        handlerCode: 'return ctx.args.name;',
      });
      const loaded = await loadCommandHandler(tempDir, 'commands/no-schema.mjs');
      expect(typeof loaded.handler).toBe('function');
      expect(loaded.argsSchema).toBeUndefined();
    });

    it('should reject plain function default export (legacy pattern)', async () => {
      writeCommandFile(
        'legacy.mjs',
        'export default async function(ctx) { return ctx.args.name; }',
      );
      await expect(loadCommandHandler(tempDir, 'commands/legacy.mjs')).rejects.toThrow(
        /defineCommand/,
      );
      try {
        await loadCommandHandler(tempDir, 'commands/legacy.mjs');
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.COMMAND_HANDLER_NOT_FOUND);
      }
    });

    it('should reject named execute export (legacy pattern)', async () => {
      writeCommandFile(
        'legacy-execute.mjs',
        'export async function execute(ctx) { return ctx.args.name; }',
      );
      await expect(loadCommandHandler(tempDir, 'commands/legacy-execute.mjs')).rejects.toThrow(
        /defineCommand/,
      );
    });

    it('should throw when command file does not exist', async () => {
      await expect(loadCommandHandler(tempDir, 'commands/nonexistent.mjs')).rejects.toThrow();
      try {
        await loadCommandHandler(tempDir, 'commands/nonexistent.mjs');
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.COMMAND_HANDLER_NOT_FOUND);
      }
    });

    it('should throw when module has no default export', async () => {
      writeCommandFile('bad.mjs', 'export const name = "bad";');
      await expect(loadCommandHandler(tempDir, 'commands/bad.mjs')).rejects.toThrow(
        /defineCommand/,
      );
    });
  });

  describe('executeCommand', () => {
    it('should execute a handler and return its result', async () => {
      const handler = async (ctx: ExecutionContext) => `hello ${ctx.args.name}`;
      const result = await executeCommand({ handler }, mockContext);
      expect(result).toBe('hello world');
    });

    it('should validate args when argsSchema is present', async () => {
      const argsSchema = z.object({
        selector: z.string(),
      });
      const handler = async (ctx: ExecutionContext) => ctx.args.selector;
      const context = { ...mockContext, args: { selector: '.btn' } };
      const result = await executeCommand({ handler, argsSchema }, context);
      expect(result).toBe('.btn');
    });

    it('should apply defaults from argsSchema', async () => {
      const argsSchema = z.object({
        selector: z.string(),
        timeout: z.number().default(5000),
      });
      const handler = async (ctx: ExecutionContext) => ctx.args.timeout;
      const context = { ...mockContext, args: { selector: '.btn' } };
      const result = await executeCommand({ handler, argsSchema }, context);
      expect(result).toBe(5000);
    });

    it('should throw ARGS_VALIDATION_FAILED when args are invalid', async () => {
      const argsSchema = z.object({
        selector: z.string({ required_error: '--selector is required' }),
      });
      const handler = async (ctx: ExecutionContext) => ctx.args.selector;
      const context = { ...mockContext, args: {} };

      try {
        await executeCommand({ handler, argsSchema }, context);
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as { code: string; message: string };
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
        expect(error.message).toContain('--selector');
      }
    });

    it('should not validate when argsSchema is undefined', async () => {
      const handler = async (ctx: ExecutionContext) => ctx.args.anything;
      const context = { ...mockContext, args: { anything: 42 } };
      const result = await executeCommand({ handler, argsSchema: undefined }, context);
      expect(result).toBe(42);
    });

    it('should wrap handler errors in ExtensionError', async () => {
      const handler = async () => {
        throw new Error('handler failed');
      };
      try {
        await executeCommand({ handler }, mockContext);
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as { code: string; originalError: Error };
        expect(error.code).toBe(ErrorCode.COMMAND_EXECUTION_FAILED);
        expect(error.originalError?.message).toBe('handler failed');
      }
    });

    it('should pass the full context to the handler', async () => {
      const handler = async (ctx: ExecutionContext) => ({
        project: ctx.projectPath,
        name: ctx.projectName,
        cfg: ctx.config,
      });
      const result = await executeCommand({ handler }, mockContext);
      expect(result).toEqual({
        project: '/tmp/test-project',
        name: 'test-project',
        cfg: { key: 'value' },
      });
    });

    it('should handle handler returning undefined', async () => {
      const handler = async () => undefined;
      const result = await executeCommand({ handler }, mockContext);
      expect(result).toBeUndefined();
    });

    it('should not mutate the original context when validating', async () => {
      const argsSchema = z.object({
        name: z.string(),
        extra: z.string().default('injected'),
      });
      const originalArgs = { name: 'hello' };
      const context = { ...mockContext, args: { ...originalArgs } };
      const handler = async (ctx: ExecutionContext) => ctx.args;
      await executeCommand({ handler, argsSchema }, context);
      expect(context.args).toEqual({ name: 'hello' });
    });
  });

  describe('validateArgs', () => {
    it('should return parsed data on valid input', () => {
      const schema = z.object({ name: z.string() });
      const result = validateArgs(schema, { name: 'test' });
      expect(result).toEqual({ name: 'test' });
    });

    it('should apply defaults', () => {
      const schema = z.object({
        name: z.string(),
        limit: z.number().default(50),
      });
      const result = validateArgs(schema, { name: 'test' });
      expect(result).toEqual({ name: 'test', limit: 50 });
    });

    it('should throw ExtensionError on invalid input', () => {
      const schema = z.object({ name: z.string() });
      try {
        validateArgs(schema, { name: 123 });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
      }
    });

    it('should strip unknown keys with passthrough disabled', () => {
      const schema = z.object({ name: z.string() });
      const result = validateArgs(schema, { name: 'test', extra: true });
      expect(result).toEqual({ name: 'test' });
    });

    it('should reject wrong types with descriptive error', () => {
      const schema = z.object({
        count: z.number({ required_error: '--count is required' }),
      });
      try {
        validateArgs(schema, { count: 'not-a-number' });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ExtensionError);
        const error = err as ExtensionError;
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
        expect(error.message).toContain('--count');
        expect(error.message).toContain('Invalid arguments');
      }
    });

    it('should reject missing required fields', () => {
      const schema = z.object({
        url: z.string({ required_error: '--url is required' }),
      });
      try {
        validateArgs(schema, {});
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
        expect(error.message).toContain('--url');
        expect(error.message).toContain('--url is required');
      }
    });

    it('should validate enum values', () => {
      const schema = z.object({
        format: z.enum(['json', 'markdown']).default('markdown'),
      });
      expect(validateArgs(schema, { format: 'json' })).toEqual({ format: 'json' });
      expect(validateArgs(schema, {})).toEqual({ format: 'markdown' });
      try {
        validateArgs(schema, { format: 'xml' });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
        expect(error.message).toContain('--format');
      }
    });

    it('should handle nullable fields', () => {
      const schema = z.object({
        selector: z.string().nullable().default(null),
        limit: z.number().default(50),
      });
      const result = validateArgs(schema, {});
      expect(result).toEqual({ selector: null, limit: 50 });
    });

    it('should validate multiple errors at once', () => {
      const schema = z.object({
        url: z.string({ required_error: '--url is required' }),
        port: z.number({ required_error: '--port is required' }),
      });
      try {
        validateArgs(schema, {});
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.message).toContain('--url');
        expect(error.message).toContain('--port');
        expect(error.message).toContain('; ');
      }
    });

    it('should include extensionName in error when provided', () => {
      const schema = z.object({ jql: z.string() });
      try {
        validateArgs(schema, {}, 'renre-atlassian');
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.extensionName).toBe('renre-atlassian');
      }
    });

    it('should include Zod error as originalError', () => {
      const schema = z.object({ jql: z.string() });
      try {
        validateArgs(schema, {});
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.originalError).toBeDefined();
        expect(error.originalError).toHaveProperty('issues');
      }
    });
  });

  describe('formatValidationErrors', () => {
    it('should format single field error', () => {
      const schema = z.object({ selector: z.string() });
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toContain('--selector');
      }
    });

    it('should format multiple field errors', () => {
      const schema = z.object({
        selector: z.string(),
        timeout: z.number(),
      });
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toContain('--selector');
        expect(formatted).toContain('--timeout');
        expect(formatted).toContain('; ');
      }
    });

    it('should use custom error messages', () => {
      const schema = z.object({
        name: z.string({ required_error: 'name cannot be empty' }),
      });
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toBe('--name: name cannot be empty');
      }
    });
  });

  describe('end-to-end: loadCommandHandler → executeCommand', () => {
    it('should load defineCommand with argsSchema, validate, and execute', async () => {
      writeDefineCommandFile('validated.mjs', {
        argsCode: '{ selector: z.string(), timeout: z.number().default(3000) }',
        handlerCode: 'return { selector: ctx.args.selector, timeout: ctx.args.timeout };',
      });

      const loaded = await loadCommandHandler(tempDir, 'commands/validated.mjs');
      const context = { ...mockContext, args: { selector: '.my-btn' } };
      const result = await executeCommand(loaded, context);

      expect(result).toEqual({ selector: '.my-btn', timeout: 3000 });
    });

    it('should reject invalid args from loaded defineCommand schema', async () => {
      writeDefineCommandFile('strict.mjs', {
        argsCode: '{ url: z.string({ required_error: "--url is required" }).min(1) }',
        handlerCode: 'return ctx.args.url;',
      });

      const loaded = await loadCommandHandler(tempDir, 'commands/strict.mjs');
      const context = { ...mockContext, args: {} };

      try {
        await executeCommand(loaded, context);
        expect.fail('should have thrown');
      } catch (err: unknown) {
        const error = err as ExtensionError;
        expect(error.code).toBe(ErrorCode.ARGS_VALIDATION_FAILED);
        expect(error.message).toContain('--url');
        expect(error.message).toContain('--url is required');
      }
    });

    it('should pass through args when defineCommand has no argsSchema', async () => {
      writeDefineCommandFile('no-schema.mjs', {
        handlerCode: 'return ctx.args;',
      });

      const loaded = await loadCommandHandler(tempDir, 'commands/no-schema.mjs');
      expect(loaded.argsSchema).toBeUndefined();

      const rawArgs = { anything: 'works', num: 42, nested: { ok: true } };
      const context = { ...mockContext, args: rawArgs };
      const result = await executeCommand(loaded, context);

      expect(result).toEqual(rawArgs);
    });

    it('should not call handler when validation fails', async () => {
      writeCommandFile(
        'guarded.mjs',
        [
          'import { z } from "zod";',
          'globalThis.__handlerCalled = false;',
          'export default {',
          '  argsSchema: z.object({ name: z.string() }),',
          '  handler: async function(ctx) {',
          '    globalThis.__handlerCalled = true;',
          '    return "should not reach here";',
          '  },',
          '};',
        ].join('\n'),
      );

      const loaded = await loadCommandHandler(tempDir, 'commands/guarded.mjs');
      const context = { ...mockContext, args: { name: 123 } };

      try {
        await executeCommand(loaded, context);
        expect.fail('should have thrown');
      } catch {
        expect((globalThis as Record<string, unknown>).__handlerCalled).not.toBe(true);
      }
    });
  });
});
