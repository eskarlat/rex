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

function findInstalledExtension(name: string): { name: string; version: string } | null {
  const db = getDb();
  const installed = listInstalled(db);
  return installed.find((e) => e.name === name) ?? null;
}

function getVersionCandidates(name: string, projectPath: string | undefined): string[] {
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
  return candidates;
}

function findExtensionUiAsset(
  name: string,
  projectPath: string | undefined,
  assetType: 'panels' | 'widgets',
  assetId?: string,
): string | null {
  const candidates = getVersionCandidates(name, projectPath);

  for (const version of candidates) {
    const extDir = getExtensionDir(name, version);
    try {
      const manifest = loadManifest(extDir);
      const assets = manifest.ui?.[assetType] ?? [];
      const asset = assetId ? assets.find((a) => a.id === assetId) : assets[0];
      if (!asset?.entry) continue;
      const assetPath = join(extDir, asset.entry);
      if (existsSync(assetPath)) {
        return readFileSync(assetPath, 'utf-8');
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
        let widgets: Array<{ id: string; title: string; defaultSize: { w: number; h: number }; minSize?: { w: number; h: number }; maxSize?: { w: number; h: number } }> = [];
        try {
          const extDir = getExtensionDir(ext.name, ext.version);
          const manifest = loadManifest(extDir);
          hasConfig = Object.keys(manifest.config?.schema ?? {}).length > 0;
          title = manifest.title;
          panels = (manifest.ui?.panels ?? []).map((p) => ({ id: p.id, title: p.title }));
          widgets = (manifest.ui?.widgets ?? []).map((w) => ({
            id: w.id,
            title: w.title,
            defaultSize: w.defaultSize,
            ...(w.minSize ? { minSize: w.minSize } : {}),
            ...(w.maxSize ? { maxSize: w.maxSize } : {}),
          }));
        } catch { /* ignore */ }
        return {
          name: ext.name,
          version: ext.version,
          type: ext.type,
          status: 'active' as const,
          hasConfig,
          title,
          panels,
          widgets,
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
    const panelContent = findExtensionUiAsset(name, request.projectPath ?? fastify.activeProjectPath, 'panels');
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
    const panelContent = findExtensionUiAsset(name, request.projectPath ?? fastify.activeProjectPath, 'panels', panelId);
    if (!panelContent) {
      reply.code(404);
      return reply.send({ error: `Panel '${panelId}' not found for extension '${name}'` });
    }
    reply.header('Content-Type', 'application/javascript');
    return reply.send(panelContent);
  });

  // Serve widget JS by ID: /api/extensions/{name}/widgets/{widgetId}.js
  fastify.get('/api/extensions/:name/widgets/:widgetId.js', (request: FastifyRequest, reply: FastifyReply) => {
    const { name, widgetId } = request.params as { name: string; widgetId: string };
    const widgetContent = findExtensionUiAsset(name, request.projectPath ?? fastify.activeProjectPath, 'widgets', widgetId);
    if (!widgetContent) {
      reply.code(404);
      return reply.send({ error: `Widget '${widgetId}' not found for extension '${name}'` });
    }
    reply.header('Content-Type', 'application/javascript');
    return reply.send(widgetContent);
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

    const ext = findInstalledExtension(body.name);
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
    const ext = findInstalledExtension(params.name);
    if (!ext) {
      reply.code(404);
      return { error: `Extension '${params.name}' not installed` };
    }
    remove(params.name, ext.version, getDb());
    return { ok: true };
  });

  done();
};

export default extensionsRoutes;
