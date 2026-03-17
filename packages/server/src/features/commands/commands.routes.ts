import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { CommandRegistry } from '@renre-kit/cli/lib';

interface RunBody {
  command: string;
  args?: Record<string, unknown>;
}

const commandsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  const registry = new CommandRegistry();

  fastify.post('/api/run', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as RunBody;
    if (!body.command || typeof body.command !== 'string') {
      reply.code(400);
      return { error: 'command is required' };
    }

    const resolved = registry.resolve(body.command);
    if (!resolved) {
      reply.code(404);
      return { error: `Command '${body.command}' not found` };
    }

    const args = body.args ?? {};
    await resolved.handler(args);
    return { ok: true, command: body.command };
  });

  done();
};

export default commandsRoutes;
