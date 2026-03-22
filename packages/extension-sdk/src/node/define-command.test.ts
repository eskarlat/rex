import { describe, it, expect, vi } from 'vitest';
import { defineCommand, z } from './define-command.js';
import type { ExecutionContext } from '@renre-kit/shared';

describe('defineCommand', () => {
  const mockContext: ExecutionContext = {
    projectName: 'test',
    projectPath: '/tmp/test',
    config: {},
    args: {},
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };

  describe('with args schema', () => {
    it('should return DefinedCommand with handler and argsSchema', () => {
      const cmd = defineCommand({
        args: { selector: z.string() },
        handler: async (ctx) => ctx.args.selector,
      });

      expect(typeof cmd.handler).toBe('function');
      expect(cmd.argsSchema).toBeDefined();
    });

    it('should create a working zod schema from args', () => {
      const cmd = defineCommand({
        args: { selector: z.string(), timeout: z.number().default(5000) },
        handler: async (ctx) => ctx.args,
      });

      const valid = cmd.argsSchema!.safeParse({ selector: '.btn' });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data).toEqual({ selector: '.btn', timeout: 5000 });
      }

      const invalid = cmd.argsSchema!.safeParse({});
      expect(invalid.success).toBe(false);
    });

    it('should validate enum values', () => {
      const cmd = defineCommand({
        args: { format: z.enum(['json', 'markdown']).default('markdown') },
        handler: async (ctx) => ctx.args.format,
      });

      const valid = cmd.argsSchema!.safeParse({});
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data).toEqual({ format: 'markdown' });
      }

      const invalid = cmd.argsSchema!.safeParse({ format: 'xml' });
      expect(invalid.success).toBe(false);
    });

    it('should execute handler with context', async () => {
      const cmd = defineCommand({
        args: { name: z.string() },
        handler: async (ctx) => `hello ${ctx.args.name}`,
      });

      const ctx = { ...mockContext, args: { name: 'world' } };
      const result = await cmd.handler(ctx);
      expect(result).toBe('hello world');
    });

    it('should handle nullable fields', () => {
      const cmd = defineCommand({
        args: {
          selector: z.string().nullable().default(null),
          limit: z.number().default(50),
        },
        handler: async (ctx) => ctx.args,
      });

      const result = cmd.argsSchema!.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ selector: null, limit: 50 });
      }
    });
  });

  describe('without args schema', () => {
    it('should return DefinedCommand with handler and no argsSchema', () => {
      const cmd = defineCommand({
        handler: async (ctx) => ctx.projectName,
      });

      expect(typeof cmd.handler).toBe('function');
      expect(cmd.argsSchema).toBeUndefined();
    });

    it('should execute handler with context', async () => {
      const cmd = defineCommand({
        handler: async (ctx) => ctx.projectName,
      });

      const result = await cmd.handler(mockContext);
      expect(result).toBe('test');
    });
  });

  describe('z re-export', () => {
    it('should expose zod through z', () => {
      expect(typeof z.object).toBe('function');
      expect(typeof z.string).toBe('function');
      expect(typeof z.number).toBe('function');
      expect(typeof z.enum).toBe('function');
    });
  });
});
