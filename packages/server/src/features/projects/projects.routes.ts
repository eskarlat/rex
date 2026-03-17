import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { ProjectManager, EventBus } from '@renre-kit/cli/lib';

declare module 'fastify' {
  interface FastifyInstance {
    activeProjectPath: string | undefined;
  }
}

interface SetActiveBody {
  projectPath: string;
}

const projectsRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  const bus = new EventBus();
  const manager = new ProjectManager(bus);

  fastify.decorate('activeProjectPath', undefined);

  fastify.get('/api/projects', () => {
    return manager.list();
  });

  fastify.put('/api/projects/active', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as SetActiveBody;
    if (!body.projectPath || typeof body.projectPath !== 'string') {
      reply.code(400);
      return { error: 'projectPath is required' };
    }
    fastify.activeProjectPath = body.projectPath;
    return { ok: true, projectPath: fastify.activeProjectPath };
  });

  fastify.get('/api/project', (request: FastifyRequest, reply: FastifyReply): Record<string, unknown> => {
    const projectPath = request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'No project selected. Set X-RenreKit-Project header or PUT /api/projects/active.' };
    }
    const project = manager.get(projectPath);
    if (!project) {
      reply.code(404);
      return { error: 'Project not found' };
    }
    return project as unknown as Record<string, unknown>;
  });

  done();
};

export default projectsRoutes;
