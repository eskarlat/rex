import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

const mockGetActivated = vi.fn();
const mockGetExtensionDir = vi.fn();
const mockLoadManifest = vi.fn();
const mockLoadCommandHandler = vi.fn();
const mockExecuteCommand = vi.fn();
const mockResolveExtensionConfig = vi.fn().mockReturnValue({});

vi.mock('@renre-kit/cli/lib', () => ({
  getActivated: (...args: unknown[]) => mockGetActivated(...args),
  getExtensionDir: (...args: unknown[]) => mockGetExtensionDir(...args),
  loadManifest: (...args: unknown[]) => mockLoadManifest(...args),
  loadCommandHandler: (...args: unknown[]) => mockLoadCommandHandler(...args),
  executeCommand: (...args: unknown[]) => mockExecuteCommand(...args),
  resolveExtensionConfig: (...args: unknown[]) => mockResolveExtensionConfig(...args),
  ConnectionManager: vi.fn().mockImplementation(() => ({
    getConnection: vi.fn(),
    executeToolCall: vi.fn(),
    stopAll: vi.fn(),
    setMode: vi.fn(),
  })),
  getLogger: vi.fn().mockReturnValue({ info: vi.fn(), error: vi.fn() }),
  createExtensionLogger: vi.fn().mockReturnValue({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const { default: commandsRoutes } = await import('./commands.routes.js');

describe('commands routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(projectScope);
    await app.register(commandsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/run', () => {
    it('executes a resolved command', async () => {
      mockGetActivated.mockReturnValue({ ext: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/mock/extensions/ext@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext',
        version: '1.0.0',
        type: 'standard',
        commands: { hello: { handler: 'commands/hello.js', description: 'test' } },
      });
      const handler = vi.fn();
      mockLoadCommandHandler.mockResolvedValue(handler);
      mockExecuteCommand.mockResolvedValue({ output: 'done' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'ext:hello', args: { name: 'world' } },
      });
      expect(response.statusCode).toBe(200);
      expect(mockLoadCommandHandler).toHaveBeenCalledWith(
        '/mock/extensions/ext@1.0.0',
        'commands/hello.js',
      );
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        handler,
        expect.objectContaining({ args: { name: 'world' } }),
      );
    });

    it('returns 404 when extension is not activated', async () => {
      mockGetActivated.mockReturnValue({});

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'unknown:cmd' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 400 when command is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it('returns 400 when no project is selected', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        payload: { command: 'ext:hello' },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: 'No project selected' });
    });

    it('returns 400 for invalid command format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'nocolon' },
      });
      expect(response.statusCode).toBe(400);
    });

    it('returns 404 when command is not in manifest and extension is not MCP', async () => {
      mockGetActivated.mockReturnValue({ ext: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/mock/extensions/ext@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext',
        version: '1.0.0',
        type: 'standard',
        commands: {},
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'ext:missing' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('forwards MCP commands through ConnectionManager', async () => {
      mockGetActivated.mockReturnValue({ 'mcp-ext': '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/mock/extensions/mcp-ext@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'mcp-ext',
        version: '1.0.0',
        type: 'mcp',
        mcp: { transport: 'stdio', command: 'node', args: ['server.js'] },
        commands: {},
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'mcp-ext:query', args: { q: 'test' } },
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 500 when manifest load fails', async () => {
      mockGetActivated.mockReturnValue({ ext: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/mock/extensions/ext@1.0.0');
      mockLoadManifest.mockImplementation(() => {
        throw new Error('no manifest');
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'ext:hello' },
      });
      expect(response.statusCode).toBe(500);
    });

    it('uses empty object for args when not provided', async () => {
      mockGetActivated.mockReturnValue({ ext: '1.0.0' });
      mockGetExtensionDir.mockReturnValue('/mock/extensions/ext@1.0.0');
      mockLoadManifest.mockReturnValue({
        name: 'ext',
        version: '1.0.0',
        type: 'standard',
        commands: { hello: { handler: 'commands/hello.js' } },
      });
      const handler = vi.fn();
      mockLoadCommandHandler.mockResolvedValue(handler);
      mockExecuteCommand.mockResolvedValue({ output: 'done' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/run',
        headers: { 'x-renrekit-project': '/mock/project' },
        payload: { command: 'ext:hello' },
      });
      expect(response.statusCode).toBe(200);
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        handler,
        expect.objectContaining({ args: {} }),
      );
    });
  });
});
