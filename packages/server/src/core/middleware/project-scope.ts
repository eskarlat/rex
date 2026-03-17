import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    projectPath: string | undefined;
  }
}

export default fp(
  (fastify: FastifyInstance, _opts: Record<string, unknown>, done: () => void) => {
    fastify.decorateRequest('projectPath', undefined);

    fastify.addHook('onRequest', (request: FastifyRequest, _reply, hookDone) => {
      const header = request.headers['x-renrekit-project'];
      if (typeof header === 'string' && header.length > 0) {
        request.projectPath = header;
      }
      hookDone();
    });

    done();
  },
  { name: 'project-scope' },
);
