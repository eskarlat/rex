import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCommandHandler, executeCommand } from './standard-runtime.js';
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
      const handler = await loadCommandHandler(tempDir, 'commands/hello.mjs');
      expect(typeof handler).toBe('function');
    });

    it('should load a command handler that exports execute', async () => {
      writeCommandFile(
        'greet.mjs',
        'export async function execute(ctx) { return `greet ${ctx.args.name}`; }',
      );
      const handler = await loadCommandHandler(tempDir, 'commands/greet.mjs');
      expect(typeof handler).toBe('function');
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
});
