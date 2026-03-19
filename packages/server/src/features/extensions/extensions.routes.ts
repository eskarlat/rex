import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  loadManifest,
  resolveExtension,
  listAvailableExtensions,
  ensureSynced,
  installExtension,
  getExtensionDir,
  checkEngineCompat,
  CLI_VERSION,
  SDK_VERSION,
} from '@renre-kit/cli/lib';

interface InstallBody {
  name: string;
}

interface ActivateBody {
  name: string;
  version?: string;
  projectPath?: string;
}

interface DeactivateBody {
  name: string;
  projectPath?: string;
}

interface RemoveParams {
  name: string;
}

function findExtensionPanel(name: string, projectPath: string | undefined, panelId?: string): string | null {
  const db = getDb();
  const installed = listInstalled(db);
  const activated = projectPath ? getActivated(projectPath) : {};

  const activatedVersion = activated[name];
  const candidates: string[] = [];
  if (activatedVersion) {
    candidates.push(activatedVersion);
  }
  for (const ext of installed) {
    if (ext.name === name && ext.version !== activatedVersion) {
      candidates.push(ext.version);
    }
  }

  for (const version of candidates) {
    const extDir = getExtensionDir(name, version);
    try {
      const manifest = loadManifest(extDir);
      const panels = manifest.ui?.panels ?? [];
      const panel = panelId
        ? panels.find((p) => p.id === panelId)
        : panels[0];
      if (panel?.entry) {
        const panelPath = join(extDir, panel.entry);
        if (existsSync(panelPath)) {
          return readFileSync(panelPath, 'utf-8');
        }
      }
    } catch {
      // try next version
    }
  }
  return null;
}

const extensionsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  const bus = new EventBus();

  // Sync registries once at startup (background, non-blocking)
  const { registries: startupRegistries } = loadGlobalConfig();
  void ensureSynced(startupRegistries);

  fastify.get('/api/marketplace', (request: FastifyRequest) => {
    const { registries } = loadGlobalConfig();

    const db = getDb();
    const installed = listInstalled(db);
    const projectPath = request.projectPath ?? fastify.activeProjectPath;

    const activatedPlugins = projectPath ? getActivated(projectPath) : {};

    const active = installed
      .filter((ext) => activatedPlugins[ext.name] === ext.version)
      .map((ext) => {
        let hasConfig = false;
        let title: string | undefined;
        let panels: Array<{ id: string; title: string }> = [];
        try {
          const extDir = getExtensionDir(ext.name, ext.version);
          const manifest = loadManifest(extDir);
          hasConfig = Object.keys(manifest.config?.schema ?? {}).length > 0;
          title = manifest.title;
          panels = (manifest.ui?.panels ?? []).map((p) => ({ id: p.id, title: p.title }));
        } catch { /* ignore */ }
        return {
          name: ext.name,
          version: ext.version,
          type: ext.type,
          status: 'active' as const,
          hasConfig,
          title,
          panels,
        };
      });

    const installedOnly = installed
      .filter((ext) => activatedPlugins[ext.name] !== ext.version)
      .map((ext) => {
        let title: string | undefined;
        try {
          const extDir = getExtensionDir(ext.name, ext.version);
          const manifest = loadManifest(extDir);
          title = manifest.title;
        } catch { /* ignore */ }
        return {
          name: ext.name,
          version: ext.version,
          type: ext.type,
          status: 'installed' as const,
          title,
        };
      });

    const installedNames = new Set(installed.map((ext) => ext.name));
    const available = listAvailableExtensions(registries)
      .filter((entry) => !installedNames.has(entry.name))
      .map((entry) => ({
        name: entry.name,
        description: entry.description,
        version: entry.latestVersion,
        type: entry.type,
        author: entry.author,
        icon: entry.icon,
        tags: entry.tags ?? [],
        status: 'available' as const,
      }));

    return {
      active,
      installed: installedOnly,
      available,
    };
  });

  // Serve extension panel files: /api/extensions/{name}/panel.js (default first panel)
  // Note: browser import() cannot send custom headers, so we also check activeProjectPath
  fastify.get('/api/extensions/:name/panel.js', (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };
    const panelContent = findExtensionPanel(name, request.projectPath ?? fastify.activeProjectPath);
    if (!panelContent) {
      reply.code(404);
      return reply.send({ error: `Panel not found for extension '${name}'` });
    }
    reply.header('Content-Type', 'application/javascript');
    return reply.send(panelContent);
  });

  // Serve specific panel by ID: /api/extensions/{name}/panels/{panelId}.js
  fastify.get('/api/extensions/:name/panels/:panelId.js', (request: FastifyRequest, reply: FastifyReply) => {
    const { name, panelId } = request.params as { name: string; panelId: string };
    const panelContent = findExtensionPanel(name, request.projectPath ?? fastify.activeProjectPath, panelId);
    if (!panelContent) {
      reply.code(404);
      return reply.send({ error: `Panel '${panelId}' not found for extension '${name}'` });
    }
    reply.header('Content-Type', 'application/javascript');
    return reply.send(panelContent);
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

    const extDir = await installExtension(resolved.name, resolved.gitUrl, resolved.latestVersion, resolved.registryName);
    const db = getDb();
    install(resolved.name, resolved.latestVersion, resolved.registryName, resolved.type, db);

    const manifest = loadManifest(extDir);
    const compat = checkEngineCompat(manifest, CLI_VERSION, SDK_VERSION);

    reply.code(201);
    const response: Record<string, unknown> = {
      name: resolved.name,
      version: resolved.latestVersion,
      path: extDir,
    };
    if (!compat.compatible) {
      response.compatWarnings = compat.issues;
    }
    return response;
  });

  fastify.post('/api/extensions/activate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ActivateBody;
    const projectPath = body.projectPath ?? request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'projectPath is required' };
    }

    let version = body.version;
    if (!version) {
      const db = getDb();
      const installed = listInstalled(db);
      const ext = installed.find((e) => e.name === body.name);
      if (!ext) {
        reply.code(404);
        return { error: `Extension "${body.name}" is not installed.` };
      }
      version = ext.version;
    }

    const extensionDir = getExtensionDir(body.name, version);
    const missingKeys = await activate(body.name, version, projectPath, extensionDir, bus);
    return missingKeys.length > 0 ? { ok: true, missingKeys } : { ok: true };
  });

  fastify.post('/api/extensions/deactivate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as DeactivateBody;
    const projectPath = body.projectPath ?? request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'projectPath is required' };
    }

    const db = getDb();
    const installed = listInstalled(db);
    const ext = installed.find((e) => e.name === body.name);
    if (!ext) {
      reply.code(404);
      return { error: `Extension "${body.name}" is not installed.` };
    }

    const extensionDir = getExtensionDir(body.name, ext.version);
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
