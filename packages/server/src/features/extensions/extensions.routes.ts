import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  install,
  remove,
  listInstalled,
  activate,
  deactivate,
  getActivated,
  getDb,
  EventBus,
  loadGlobalConfig,
  resolveExtension,
  installExtension,
  getExtensionDir,
} from '@renre-kit/cli/lib';

interface InstallBody {
  name: string;
}

interface ActivateBody {
  name: string;
  version: string;
  projectPath?: string;
}

interface DeactivateBody {
  name: string;
  projectPath?: string;
}

interface RemoveParams {
  name: string;
}

const extensionsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  const bus = new EventBus();

  fastify.get('/api/marketplace', (request: FastifyRequest) => {
    const db = getDb();
    const installed = listInstalled(db);
    const projectPath = request.projectPath;

    const activatedPlugins = projectPath ? getActivated(projectPath) : {};

    const active = installed
      .filter((ext) => activatedPlugins[ext.name] !== undefined)
      .map((ext) => ({
        name: ext.name,
        version: ext.version,
        type: ext.type,
        status: 'active' as const,
      }));

    const installedOnly = installed
      .filter((ext) => activatedPlugins[ext.name] === undefined)
      .map((ext) => ({
        name: ext.name,
        version: ext.version,
        type: ext.type,
        status: 'installed' as const,
      }));

    return {
      active,
      installed: installedOnly,
      available: [],
    };
  });

  fastify.post('/api/extensions/install', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as InstallBody;
    if (!body.name || typeof body.name !== 'string') {
      reply.code(400);
      return { error: 'name is required' };
    }

    const config = loadGlobalConfig();
    const resolved = resolveExtension(body.name, config.registries);
    if (!resolved) {
      reply.code(404);
      return { error: `Extension '${body.name}' not found in registries` };
    }

    const extDir = await installExtension(resolved.name, resolved.gitUrl, resolved.latestVersion);
    const db = getDb();
    install(resolved.name, resolved.latestVersion, resolved.registryName, resolved.type, db);

    reply.code(201);
    return {
      name: resolved.name,
      version: resolved.latestVersion,
      path: extDir,
    };
  });

  fastify.post('/api/extensions/activate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ActivateBody;
    const projectPath = body.projectPath ?? request.projectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'projectPath is required' };
    }

    const extensionDir = getExtensionDir(body.name, body.version);
    const missingKeys = await activate(body.name, body.version, projectPath, extensionDir, bus);
    return { ok: true, missingKeys };
  });

  fastify.post('/api/extensions/deactivate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as DeactivateBody;
    const projectPath = body.projectPath ?? request.projectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'projectPath is required' };
    }

    const extensionDir = getExtensionDir(body.name, '');
    await deactivate(body.name, projectPath, extensionDir, bus);
    return { ok: true };
  });

  fastify.delete('/api/extensions/:name', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as RemoveParams;
    const db = getDb();
    const installed = listInstalled(db);
    const ext = installed.find((e) => e.name === params.name);
    if (!ext) {
      reply.code(404);
      return { error: `Extension '${params.name}' not installed` };
    }
    remove(params.name, ext.version, db);
    return { ok: true };
  });

  done();
};

export default extensionsRoutes;
