import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  getActivated,
  getExtensionDir,
  loadManifest,
  loadCommandHandler,
  executeCommand,
  ConnectionManager,
  resolveExtensionConfig,
  getLogger,
  createExtensionLogger,
} from '@renre-kit/cli/lib';
import type { ExtensionManifest } from '@renre-kit/cli/lib';

interface RunBody {
  command: string;
  args?: Record<string, unknown>;
}

interface ResolvedCommand {
  extName: string;
  cmdName: string;
  extDir: string;
  manifest: ExtensionManifest;
}

interface CommandError {
  error: string;
  status: number;
}

type CommandResolution = { ok: true; value: ResolvedCommand } | { ok: false; value: CommandError };

function resolveCommand(command: string, projectPath: string): CommandResolution {
  const colonIdx = command.indexOf(':');
  if (colonIdx <= 0) {
    return {
      ok: false,
      value: {
        error: `Invalid command format: '${command}'. Expected 'extension:command'.`,
        status: 400,
      },
    };
  }

  const extName = command.substring(0, colonIdx);
  const cmdName = command.substring(colonIdx + 1);
  const plugins = getActivated(projectPath);
  const version = plugins[extName];

  if (!version) {
    return {
      ok: false,
      value: { error: `Extension '${extName}' is not activated in this project`, status: 404 },
    };
  }

  const extDir = getExtensionDir(extName, version);
  try {
    const manifest = loadManifest(extDir);
    return { ok: true, value: { extName, cmdName, extDir, manifest } };
  } catch {
    return { ok: false, value: { error: `Failed to load manifest for '${extName}'`, status: 500 } };
  }
}

async function executeMcpTool(
  connectionManager: ConnectionManager,
  extName: string,
  cmdName: string,
  extDir: string,
  manifest: ExtensionManifest,
  projectPath: string,
  args: Record<string, unknown>,
): Promise<{ output: string; exitCode: number }> {
  const configSchema = manifest.config?.schema ?? {};
  const resolvedConfig = resolveExtensionConfig(extName, configSchema, projectPath);
  connectionManager.getConnection(extName, manifest.mcp!, resolvedConfig, extDir);
  const result = await connectionManager.executeToolCall(extName, cmdName, args);
  let output = '';
  if (result !== undefined && result !== null) {
    output = typeof result === 'string' ? result : JSON.stringify(result);
  }
  return { output, exitCode: 0 };
}

async function executeResolvedCommand(
  connectionManager: ConnectionManager,
  resolved: ResolvedCommand,
  projectPath: string,
  body: RunBody,
  reply: FastifyReply,
): Promise<unknown> {
  const { extName, cmdName, extDir, manifest } = resolved;
  const args = body.args ?? {};
  const configSchema = manifest.config?.schema ?? {};
  const resolvedConfig = resolveExtensionConfig(extName, configSchema, projectPath);

  const cmdDef = manifest.commands[cmdName];
  if (cmdDef) {
    getLogger().info('commands', `Executing ${body.command}`, {
      type: 'standard',
      handler: cmdDef.handler,
    });
    const handler = await loadCommandHandler(extDir, cmdDef.handler);
    return executeCommand(handler, {
      projectName: '',
      projectPath,
      args,
      config: resolvedConfig,
      logger: createExtensionLogger(extName),
    });
  }

  if (manifest.type === 'mcp' && manifest.mcp) {
    getLogger().info('commands', `Executing ${body.command}`, { type: 'mcp', tool: cmdName });
    try {
      return await executeMcpTool(
        connectionManager,
        extName,
        cmdName,
        extDir,
        manifest,
        projectPath,
        args,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      getLogger().error('commands', `MCP tool call failed: ${message}`, { tool: cmdName });
      reply.code(502);
      return { error: `MCP tool call failed: ${message}`, exitCode: 1 };
    }
  }

  reply.code(404);
  return { error: `Command '${cmdName}' not found in extension '${extName}'` };
}

const commandsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  const connectionManager = new ConnectionManager();
  connectionManager.setMode('dashboard');

  fastify.post('/api/run', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as RunBody;
    if (!body.command || typeof body.command !== 'string') {
      reply.code(400);
      return { error: 'command is required' };
    }

    const projectPath = request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'No project selected' };
    }

    const resolution = resolveCommand(body.command, projectPath);
    if (!resolution.ok) {
      reply.code(resolution.value.status);
      return { error: resolution.value.error };
    }

    return executeResolvedCommand(connectionManager, resolution.value, projectPath, body, reply);
  });

  done();
};

export default commandsRoutes;
