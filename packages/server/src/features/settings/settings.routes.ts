import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  loadGlobalConfig,
  saveGlobalConfig,
  resolveExtensionConfig,
  setExtensionConfig,
} from '@renre-kit/cli/lib';
import type { GlobalConfig, ConfigMapping, ConfigSchemaField } from '@renre-kit/cli/lib';

interface ExtensionNameParams {
  name: string;
}

interface SetExtConfigBody {
  fieldName: string;
  mapping: ConfigMapping;
}

interface ResolveExtConfigBody {
  schema?: Record<string, ConfigSchemaField>;
}

const settingsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/settings', () => {
    const config = loadGlobalConfig();
    return config;
  });

  fastify.put('/api/settings', (request: FastifyRequest) => {
    const body = request.body as GlobalConfig;
    saveGlobalConfig(body);
    return { ok: true };
  });

  fastify.get('/api/settings/extensions/:name', (request: FastifyRequest) => {
    const params = request.params as ExtensionNameParams;
    const body = request.query as ResolveExtConfigBody;
    const schema = body.schema ?? {};
    const resolved = resolveExtensionConfig(params.name, schema, request.projectPath);
    return resolved;
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
