import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import semver from 'semver';
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
  checkEngineConstraints,
  readUpdateCache,
  refreshUpdateCache,
  resolveRegistryIcon,
  CLI_VERSION,
  SDK_VERSION,
} from '@renre-kit/cli/lib';

interface InstallBody {
  name: string;
}

interface UpdateBody {
  name: string;
  force?: boolean;
}

interface UpdateValidationError {
  code: number;
  body: Record<string, unknown>;
}

interface UpdateValidationSuccess {
  ext: { name: string; version: string };
  resolved: NonNullable<ReturnType<typeof resolveExtension>>;
  config: ReturnType<typeof loadGlobalConfig>;
  db: ReturnType<typeof getDb>;
}

function validateUpdate(
  body: UpdateBody,
): UpdateValidationError | UpdateValidationSuccess {
  const db = getDb();
  const installed = listInstalled(db);
  const ext = installed.find((e) => e.name === body.name);
  if (!ext) {
    return { code: 404, body: { error: `Extension "${body.name}" is not installed.` } };
  }

  const config = loadGlobalConfig();
  const resolved = resolveExtension(body.name, config.registries);
  if (!resolved) {
    return { code: 404, body: { error: `Extension "${body.name}" not found in any registry.` } };
  }

  if (!semver.valid(resolved.latestVersion) || !semver.valid(ext.version) || !semver.gt(resolved.latestVersion, ext.version)) {
    return { code: 200, body: { name: body.name, message: 'Already up to date' } };
  }

  const compat = checkEngineConstraints(resolved.engines, CLI_VERSION, SDK_VERSION);
  if (!compat.compatible && !body.force) {
    return { code: 409, body: { error: 'Engine incompatible', issues: compat.issues } };
  }

  return { ext, resolved, config, db };
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

const ICON_CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function isIconSafe(extDir: string, iconField: string): boolean {
  const iconPath = resolve(extDir, iconField);
  const rel = relative(extDir, iconPath);
  return !rel.startsWith('..') && resolve(iconPath) === iconPath && existsSync(iconPath);
}

function readIconFromDir(extDir: string): { content: Buffer; contentType: string } | null {
  const manifest = loadManifest(extDir);
  if (!manifest.icon) return null;
  if (!isIconSafe(extDir, manifest.icon)) return null;
  const iconPath = resolve(extDir, manifest.icon);
  const ext = iconPath.substring(iconPath.lastIndexOf('.'));
  const contentType = ICON_CONTENT_TYPES[ext] ?? 'application/octet-stream';
  return { content: readFileSync(iconPath), contentType };
}

function findExtensionIcon(
  name: string,
  projectPath: string | undefined,
): { content: Buffer; contentType: string } | null {
  const candidates = getVersionCandidates(name, projectPath);

  for (const version of candidates) {
    try {
      return readIconFromDir(getExtensionDir(name, version));
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
  void ensureSynced(startupRegistries).then(() => refreshUpdateCache(getDb(), startupRegistries)).catch(() => {});

  fastify.get('/api/marketplace', (request: FastifyRequest) => {
    const { registries } = loadGlobalConfig();

    const db = getDb();
    const installed = listInstalled(db);
    const projectPath = request.projectPath ?? fastify.activeProjectPath;

    const activatedPlugins = projectPath ? getActivated(projectPath) : {};
    const updateCache = readUpdateCache();
    const updateMap = new Map(
      (updateCache?.updates ?? []).map((u) => [u.name, u]),
    );

    function getUpdateInfo(extName: string): { updateAvailable: string | null; engineCompatible: boolean } {
      const update = updateMap.get(extName);
      if (!update) return { updateAvailable: null, engineCompatible: true };
      return { updateAvailable: update.availableVersion, engineCompatible: update.engineCompatible };
    }

    const active = installed
      .filter((ext) => activatedPlugins[ext.name] === ext.version)
      .map((ext) => {
        let hasConfig = false;
        let title: string | undefined;
        let description: string | undefined;
        let hasIcon = false;
        let panels: Array<{ id: string; title: string }> = [];
        let widgets: Array<{ id: string; title: string; defaultSize: { w: number; h: number }; minSize?: { w: number; h: number }; maxSize?: { w: number; h: number } }> = [];
        try {
          const extDir = getExtensionDir(ext.name, ext.version);
          const manifest = loadManifest(extDir);
          hasConfig = Object.keys(manifest.config?.schema ?? {}).length > 0;
          title = manifest.title;
          description = manifest.description;
          hasIcon = !!manifest.icon && isIconSafe(extDir, manifest.icon);
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
          description,
          hasIcon,
          panels,
          widgets,
          ...getUpdateInfo(ext.name),
        };
      });

    const installedOnly = installed
      .filter((ext) => activatedPlugins[ext.name] !== ext.version)
      .map((ext) => {
        let title: string | undefined;
        let description: string | undefined;
        let hasIcon = false;
        try {
          const extDir = getExtensionDir(ext.name, ext.version);
          const manifest = loadManifest(extDir);
          title = manifest.title;
          description = manifest.description;
          hasIcon = !!manifest.icon && isIconSafe(extDir, manifest.icon);
        } catch { /* ignore */ }
        return {
          name: ext.name,
          version: ext.version,
          type: ext.type,
          status: 'installed' as const,
          title,
          description,
          hasIcon,
          ...getUpdateInfo(ext.name),
        };
      });

    const installedNames = new Set(installed.map((ext) => ext.name));
    const availableEntries = listAvailableExtensions(registries)
      .filter((entry) => !installedNames.has(entry.name));

    // Pre-compute icon availability, skipping entries without an icon field
    const extensionsWithIcons = new Set<string>();
    for (const entry of availableEntries) {
      if (entry.icon) {
        const iconPath = resolveRegistryIcon(entry.name, registries);
        if (iconPath) extensionsWithIcons.add(entry.name);
      }
    }

    const available = availableEntries.map((entry) => ({
      name: entry.name,
      description: entry.description,
      version: entry.latestVersion,
      type: entry.type,
      author: entry.author,
      icon: entry.icon,
      tags: entry.tags ?? [],
      status: 'available' as const,
      hasIcon: extensionsWithIcons.has(entry.name),
    }));

    return {
      active,
      installed: installedOnly,
      available,
    };
  });

  fastify.get('/api/updates', (): { checkedAt: string | null; updates: unknown[] } => {
    const cache = readUpdateCache();
    if (cache) return cache;
    return { checkedAt: null, updates: [] };
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

  // Serve extension icon: /api/extensions/{name}/icon
  // Checks installed extension directory first, then falls back to registry icons
  fastify.get('/api/extensions/:name/icon', (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };

    // Try installed extension directory first
    const icon = findExtensionIcon(name, request.projectPath ?? fastify.activeProjectPath);
    if (icon) {
      reply.header('Content-Type', icon.contentType);
      reply.header('Cache-Control', 'public, max-age=3600');
      return reply.send(icon.content);
    }

    // Fall back to registry icon (for available/not-installed extensions)
    const { registries } = loadGlobalConfig();
    const registryIconPath = resolveRegistryIcon(name, registries);
    if (registryIconPath) {
      const ext = registryIconPath.substring(registryIconPath.lastIndexOf('.'));
      const contentType = ICON_CONTENT_TYPES[ext] ?? 'application/octet-stream';
      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'public, max-age=3600');
      return reply.send(readFileSync(registryIconPath));
    }

    reply.code(404);
    return reply.send({ error: `Icon not found for extension '${name}'` });
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

  fastify.post('/api/extensions/update', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as UpdateBody;
    if (!body.name || typeof body.name !== 'string') {
      reply.code(400);
      return { error: 'name is required' };
    }
    if (body.force !== undefined && typeof body.force !== 'boolean') {
      reply.code(400);
      return { error: 'force must be a boolean' };
    }

    const result = validateUpdate(body);
    if ('code' in result) {
      reply.code(result.code);
      return result.body;
    }

    const { ext, resolved, config, db } = result;
    const extDir = await installExtension(resolved.name, resolved.gitUrl, resolved.latestVersion, resolved.registryName);
    install(resolved.name, resolved.latestVersion, resolved.registryName, resolved.type, db);

    // Re-activate if the extension was active in the project
    const projectPath = request.projectPath ?? fastify.activeProjectPath;
    if (projectPath) {
      const plugins = getActivated(projectPath);
      if (plugins[body.name]) {
        await activate(body.name, resolved.latestVersion, projectPath, extDir, bus);
      }
    }

    refreshUpdateCache(db, config.registries);

    return {
      name: resolved.name,
      oldVersion: ext.version,
      newVersion: resolved.latestVersion,
    };
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
