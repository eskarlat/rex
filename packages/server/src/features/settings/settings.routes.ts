import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  loadGlobalConfig,
  saveGlobalConfig,
  resolveExtensionConfig,
  setExtensionConfig,
  getLogger,
  getActivated,
  getExtensionDir,
  loadManifest,
} from '@renre-kit/cli/lib';
import type { GlobalConfig, ConfigMapping, ConfigSchemaField, LogLevel } from '@renre-kit/cli/lib';

interface ExtensionNameParams {
  name: string;
}

interface SetExtConfigBody {
  fieldName: string;
  mapping: ConfigMapping;
}


const settingsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/settings', () => {
    const config = loadGlobalConfig();
    return config;
  });

  fastify.put('/api/settings', (request: FastifyRequest) => {
    const body = request.body as GlobalConfig;
    saveGlobalConfig(body);

    // Apply log level change immediately
    const logLevels = body.settings.logLevels;
    if (Array.isArray(logLevels) && logLevels.length > 0) {
      const hierarchy: LogLevel[] = ['debug', 'info', 'warn', 'error'];
      const minLevel = hierarchy.find((l) => (logLevels as string[]).includes(l));
      if (minLevel) {
        getLogger().setLevel(minLevel);
      }
    }

    return { ok: true };
  });

  fastify.get('/api/settings/extensions/:name', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as ExtensionNameParams;
    const projectPath = request.projectPath ?? fastify.activeProjectPath;

    // Load manifest to get the config schema
    const plugins = projectPath ? getActivated(projectPath) : {};
    const version = plugins[params.name];
    if (!version) {
      reply.code(404);
      return { error: `Extension '${params.name}' is not activated` };
    }

    const extDir = getExtensionDir(params.name, version);
    let schema: Record<string, ConfigSchemaField> = {};
    try {
      const manifest = loadManifest(extDir);
      schema = manifest.config?.schema ?? {};
    } catch {
      // no schema
    }

    const values = resolveExtensionConfig(params.name, schema, projectPath);
    return { schema, values };
  });

  fastify.put('/api/settings/extensions/:name', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as ExtensionNameParams;
    const body = request.body as SetExtConfigBody;
    if (!body.fieldName || !body.mapping) {
      reply.code(400);
      return { error: 'fieldName and mapping are required' };
    }
    setExtensionConfig(params.name, body.fieldName, body.mapping);
    return { ok: true };
  });

  done();
};

export default settingsRoutes;
