import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { listEntries, setEntry, removeEntry } from '@renre-kit/cli/lib';

interface SetEntryBody {
  key: string;
  value: string;
  secret: boolean;
  tags?: string[];
}

interface VaultKeyParams {
  key: string;
}

interface UpdateEntryBody {
  value: string;
  secret: boolean;
  tags?: string[];
}

const vaultRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/vault', () => {
    const entries = listEntries();
    return entries;
  });

  fastify.post('/api/vault', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as SetEntryBody;
    if (!body.key || typeof body.key !== 'string') {
      reply.code(400);
      return { error: 'key is required' };
    }
    if (typeof body.value !== 'string') {
      reply.code(400);
      return { error: 'value is required' };
    }
    setEntry(body.key, body.value, body.secret, body.tags ?? []);
    reply.code(201);
    return { ok: true };
  });

  fastify.put('/api/vault/:key', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as VaultKeyParams;
    const body = request.body as UpdateEntryBody;
    if (typeof body.value !== 'string') {
      reply.code(400);
      return { error: 'value is required' };
    }
    setEntry(params.key, body.value, body.secret, body.tags ?? []);
    return { ok: true };
  });

  fastify.delete('/api/vault/:key', (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as VaultKeyParams;
    const removed = removeEntry(params.key);
    if (!removed) {
      reply.code(404);
      return { error: `Vault key '${params.key}' not found` };
    }
    return { ok: true };
  });

  done();
};

export default vaultRoutes;
