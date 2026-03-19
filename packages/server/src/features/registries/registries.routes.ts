import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  loadGlobalConfig,
  saveGlobalConfig,
  sync,
  listRegistries,
} from '@renre-kit/cli/lib';
import type { RegistryConfig } from '@renre-kit/cli/lib';

interface RegistryNameParams {
  name: string;
}

interface AddRegistryBody {
  name: string;
  url: string;
  priority?: number;
  cacheTTL?: number;
}

const DEFAULT_PRIORITY = 100;
const DEFAULT_CACHE_TTL = 3600;

const registriesRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/registries', () => {
    const config = loadGlobalConfig();
    const statuses = listRegistries(config.registries);
    return statuses.map((s) => ({
      name: s.name,
      url: s.url,
      priority: s.priority,
      last_synced: s.lastFetched?.toISOString() ?? undefined,
    }));
  });

  fastify.post('/api/registries', (request: FastifyRequest, reply: FastifyReply): Record<string, unknown> => {
    const body = request.body as AddRegistryBody;
    if (!body.name || !body.url) {
      reply.code(400);
      return { error: 'name and url are required' };
    }

    const config = loadGlobalConfig();
    const existing = config.registries.find((r) => r.name === body.name);
    if (existing) {
      reply.code(409);
      return { error: `Registry '${body.name}' already exists` };
    }

    const entry: RegistryConfig = {
      name: body.name,
      url: body.url,
      priority: body.priority ?? DEFAULT_PRIORITY,
      cacheTTL: body.cacheTTL ?? DEFAULT_CACHE_TTL,
    };
    config.registries.push(entry);
    saveGlobalConfig(config);
    reply.code(201);
    return entry as unknown as Record<string, unknown>;
  });

  fastify.delete('/api/registries/:name', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as RegistryNameParams;
    const config = loadGlobalConfig();
    const idx = config.registries.findIndex((r) => r.name === params.name);
    if (idx === -1) {
      reply.code(404);
      return { error: `Registry '${params.name}' not found` };
    }
    config.registries.splice(idx, 1);
    saveGlobalConfig(config);
    return { ok: true };
  });

  fastify.post('/api/registries/:name/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as RegistryNameParams;
    const config = loadGlobalConfig();
    const registry = config.registries.find((r) => r.name === params.name);
    if (!registry) {
      reply.code(404);
      return { error: `Registry '${params.name}' not found` };
    }
    await sync(params.name, registry);
    return { ok: true };
  });

  done();
};

export default registriesRoutes;
