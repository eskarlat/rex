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
import { ErrorCode } from '../../../core/errors/extension-error.js';

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

  describe('loadCommandHandler', () => {
    it('should load a valid command handler that exports default', async () => {
      writeCommandFile(
        'hello.mjs',
        'export default async function(ctx) { return `hello ${ctx.args.name}`; }',
      );
      const loaded = await loadCommandHandler(tempDir, 'commands/hello.mjs');
      expect(typeof loaded.handler).toBe('function');
      expect(loaded.argsSchema).toBeUndefined();
    });

    it('should load a command handler that exports execute', async () => {
      writeCommandFile(
        'greet.mjs',
        'export async function execute(ctx) { return `greet ${ctx.args.name}`; }',
      );
      const loaded = await loadCommandHandler(tempDir, 'commands/greet.mjs');
      expect(typeof loaded.handler).toBe('function');
    });

    it('should load argsSchema when exported', async () => {
      writeCommandFile(
        'with-schema.mjs',
        [
          'import { z } from "zod";',
          'export const argsSchema = z.object({ selector: z.string() });',
          'export default async function(ctx) { return ctx.args.selector; }',
        ].join('\n'),
      );
      const loaded = await loadCommandHandler(tempDir, 'commands/with-schema.mjs');
      expect(typeof loaded.handler).toBe('function');
      expect(loaded.argsSchema).toBeDefined();
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

    it('should throw when module has no default or execute export', async () => {
      writeCommandFile('bad.mjs', 'export const name = "bad";');
      await expect(loadCommandHandler(tempDir, 'commands/bad.mjs')).rejects.toThrow();
      try {
        await loadCommandHandler(tempDir, 'commands/bad.mjs');
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.COMMAND_HANDLER_NOT_FOUND);
      }
    });
  });

  describe('executeCommand', () => {
    it('should execute a handler and return its result', async () => {
      const handler = async (ctx: ExecutionContext) => `hello ${ctx.args.name}`;
      const result = await executeCommand(handler, mockContext);
      expect(result).toBe('hello world');
    });

    it('should accept LoadedCommand object', async () => {
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
      await expect(executeCommand(handler, mockContext)).rejects.toThrow();
      try {
        await executeCommand(handler, mockContext);
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
      const result = await executeCommand(handler, mockContext);
      expect(result).toEqual({
        project: '/tmp/test-project',
        name: 'test-project',
        cfg: { key: 'value' },
      });
    });

    it('should handle handler returning undefined', async () => {
      const handler = async () => undefined;
      const result = await executeCommand(handler, mockContext);
      expect(result).toBeUndefined();
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
  });
});
