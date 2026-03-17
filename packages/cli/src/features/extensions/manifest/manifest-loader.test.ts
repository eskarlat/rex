import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadManifest } from './manifest-loader.js';
import { ErrorCode } from '../../../core/errors/extension-error.js';

describe('manifest-loader', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'renre-kit-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function writeManifest(manifest: Record<string, unknown>): void {
    writeFileSync(
      join(tempDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
    );
  }

  const validStandardManifest = {
    name: 'test-extension',
    version: '1.0.0',
    description: 'A test extension',
    type: 'standard',
    commands: {
      hello: { handler: 'commands/hello.js', description: 'Say hello' },
    },
  };

  const validMcpManifest = {
    name: 'mcp-extension',
    version: '2.0.0',
    description: 'An MCP extension',
    type: 'mcp',
    commands: {
      query: { handler: 'tool-name' },
    },
    mcp: {
      transport: 'stdio',
      command: 'node',
      args: ['server.js'],
    },
  };

  describe('loadManifest', () => {
    it('should load and parse a valid standard manifest', () => {
      writeManifest(validStandardManifest);
      const result = loadManifest(tempDir);
      expect(result.name).toBe('test-extension');
      expect(result.version).toBe('1.0.0');
      expect(result.type).toBe('standard');
      expect(result.commands.hello).toEqual({
        handler: 'commands/hello.js',
        description: 'Say hello',
      });
    });

    it('should load and parse a valid MCP manifest', () => {
      writeManifest(validMcpManifest);
      const result = loadManifest(tempDir);
      expect(result.name).toBe('mcp-extension');
      expect(result.type).toBe('mcp');
      expect(result.mcp?.transport).toBe('stdio');
      expect(result.mcp?.command).toBe('node');
    });

    it('should load a manifest with all optional fields', () => {
      writeManifest({
        ...validStandardManifest,
        icon: '🔧',
        iconColor: '#FF0000',
        hooks: { onInit: 'hooks/init.js', onDestroy: 'hooks/destroy.js' },
        agent: {
          skills: [
            { name: 'greet', path: 'skills/greet/SKILL.md' },
          ],
          prompts: ['agent/prompts/default.md'],
          context: ['agent/context/docs.md'],
        },
        ui: {
          panels: [
            { id: 'panel-1', title: 'Dashboard', entry: 'ui/dashboard.js' },
          ],
        },
        config: {
          schema: {
            apiKey: {
              type: 'string',
              description: 'API key',
              secret: true,
              vaultHint: 'ext.test.apiKey',
            },
            retries: {
              type: 'number',
              description: 'Retry count',
              secret: false,
              default: 3,
            },
          },
        },
      });
      const result = loadManifest(tempDir);
      expect(result.icon).toBe('🔧');
      expect(result.hooks?.onInit).toBe('hooks/init.js');
      expect(result.agent?.skills).toHaveLength(1);
      expect(result.agent?.prompts).toHaveLength(1);
      expect(result.agent?.context).toHaveLength(1);
      expect(result.ui?.panels).toHaveLength(1);
      expect(result.config?.schema.apiKey?.secret).toBe(true);
      expect(result.config?.schema.retries?.default).toBe(3);
    });

    it('should load MCP SSE manifest with url and headers', () => {
      writeManifest({
        name: 'sse-ext',
        version: '1.0.0',
        description: 'SSE extension',
        type: 'mcp',
        commands: { search: { handler: 'search-tool' } },
        mcp: {
          transport: 'sse',
          url: 'http://localhost:3000/${config.endpoint}',
          headers: { Authorization: 'Bearer ${config.token}' },
        },
      });
      const result = loadManifest(tempDir);
      expect(result.mcp?.transport).toBe('sse');
      expect(result.mcp?.url).toBe('http://localhost:3000/${config.endpoint}');
    });

    it('should throw when manifest.json does not exist', () => {
      expect(() => loadManifest(tempDir)).toThrow();
      try {
        loadManifest(tempDir);
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.MANIFEST_NOT_FOUND);
      }
    });

    it('should throw when manifest.json contains invalid JSON', () => {
      writeFileSync(join(tempDir, 'manifest.json'), '{ invalid json }');
      expect(() => loadManifest(tempDir)).toThrow();
      try {
        loadManifest(tempDir);
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.MANIFEST_INVALID);
      }
    });

    it('should throw when required field "name" is missing', () => {
      writeManifest({ version: '1.0.0', type: 'standard', commands: {}, description: 'x' });
      expect(() => loadManifest(tempDir)).toThrow();
      try {
        loadManifest(tempDir);
      } catch (err: unknown) {
        const error = err as { code: string };
        expect(error.code).toBe(ErrorCode.MANIFEST_INVALID);
      }
    });

    it('should throw when required field "version" is missing', () => {
      writeManifest({ name: 'test', type: 'standard', commands: {}, description: 'x' });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should throw when required field "type" is missing', () => {
      writeManifest({ name: 'test', version: '1.0.0', commands: {}, description: 'x' });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should throw when required field "commands" is missing', () => {
      writeManifest({ name: 'test', version: '1.0.0', type: 'standard', description: 'x' });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should throw when type is invalid', () => {
      writeManifest({
        name: 'test',
        version: '1.0.0',
        description: 'x',
        type: 'invalid',
        commands: {},
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should throw when type is mcp but mcp config is missing', () => {
      writeManifest({
        name: 'test',
        version: '1.0.0',
        description: 'test',
        type: 'mcp',
        commands: { foo: { handler: 'bar' } },
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should throw when type is mcp but mcp.transport is missing', () => {
      writeManifest({
        name: 'test',
        version: '1.0.0',
        description: 'test',
        type: 'mcp',
        commands: { foo: { handler: 'bar' } },
        mcp: {},
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should allow standard type without mcp config', () => {
      writeManifest(validStandardManifest);
      const result = loadManifest(tempDir);
      expect(result.mcp).toBeUndefined();
    });

    it('should strip unknown fields', () => {
      writeManifest({
        ...validStandardManifest,
        unknownField: 'should be stripped',
      });
      const result = loadManifest(tempDir);
      expect((result as Record<string, unknown>)['unknownField']).toBeUndefined();
    });

    it('should accept empty commands object', () => {
      writeManifest({
        name: 'empty-cmds',
        version: '1.0.0',
        description: 'No commands',
        type: 'standard',
        commands: {},
      });
      const result = loadManifest(tempDir);
      expect(Object.keys(result.commands)).toHaveLength(0);
    });

    it('should include extension dir path in error when manifest not found', () => {
      try {
        loadManifest(tempDir);
      } catch (err: unknown) {
        const error = err as Error;
        expect(error.message).toContain(tempDir);
      }
    });

    // --- Agent assets support ---

    it('should accept agent with skills array', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          skills: [
            { name: 'greet', path: 'skills/greet/SKILL.md' },
            { name: 'analyze', path: 'skills/analyze/SKILL.md' },
          ],
        },
      });
      const result = loadManifest(tempDir);
      expect(result.agent?.skills).toHaveLength(2);
      expect(result.agent?.skills?.[0]?.name).toBe('greet');
      expect(result.agent?.skills?.[0]?.path).toBe('skills/greet/SKILL.md');
      expect(result.agent?.skills?.[1]?.name).toBe('analyze');
    });

    it('should reject agent.skills entry with missing name', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          skills: [{ path: 'skills/greet/SKILL.md' }],
        },
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should reject agent.skills entry with missing path', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          skills: [{ name: 'greet' }],
        },
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should accept agent with all asset types', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          skills: [{ name: 'greet', path: 'skills/greet/SKILL.md' }],
          prompts: ['agent/prompts/default.md', 'agent/prompts/custom.md'],
          agents: ['agent/agents/researcher.md'],
          workflows: ['agent/workflows/deploy.md'],
          context: ['agent/context/docs.md'],
        },
      });
      const result = loadManifest(tempDir);
      expect(result.agent?.skills).toHaveLength(1);
      expect(result.agent?.prompts).toHaveLength(2);
      expect(result.agent?.agents).toHaveLength(1);
      expect(result.agent?.workflows).toHaveLength(1);
      expect(result.agent?.context).toHaveLength(1);
    });

    it('should accept agent with partial assets (only prompts)', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          prompts: ['agent/prompts/default.md'],
        },
      });
      const result = loadManifest(tempDir);
      expect(result.agent?.prompts).toHaveLength(1);
      expect(result.agent?.skills).toBeUndefined();
    });

    it('should accept empty arrays in agent assets', () => {
      writeManifest({
        ...validStandardManifest,
        agent: {
          skills: [],
          prompts: [],
          agents: [],
          workflows: [],
          context: [],
        },
      });
      const result = loadManifest(tempDir);
      expect(result.agent).toBeDefined();
    });

    it('should reject agent as a string', () => {
      writeManifest({
        ...validStandardManifest,
        agent: 'agent/',
      });
      expect(() => loadManifest(tempDir)).toThrow();
    });

    it('should strip top-level skills field (not part of schema)', () => {
      writeManifest({
        ...validStandardManifest,
        skills: 'SKILL.md',
      });
      const result = loadManifest(tempDir);
      expect((result as Record<string, unknown>)['skills']).toBeUndefined();
    });
  });
});
