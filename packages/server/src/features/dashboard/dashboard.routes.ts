import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import {
  getDashboardLayout,
  saveDashboardLayout,
} from '@renre-kit/cli/lib';
import type { DashboardLayout } from '@renre-kit/cli/lib';

const dashboardRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.get('/api/dashboard/layout', (request: FastifyRequest) => {
    const projectPath = request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      return { widgets: [] };
    }
    return getDashboardLayout(projectPath);
  });

  fastify.put('/api/dashboard/layout', (request: FastifyRequest, reply: FastifyReply) => {
    const projectPath = request.projectPath ?? fastify.activeProjectPath;
    if (!projectPath) {
      reply.code(400);
      return { error: 'projectPath is required' };
    }
    const layout = request.body as DashboardLayout;
    saveDashboardLayout(projectPath, layout);
    return { ok: true };
  });

  done();
};

export default dashboardRoutes;
