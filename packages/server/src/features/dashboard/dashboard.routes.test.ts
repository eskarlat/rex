import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

const mockGetDashboardLayout = vi.fn();
const mockSaveDashboardLayout = vi.fn();

vi.mock('@renre-kit/cli/lib', () => ({
  getDashboardLayout: (...args: unknown[]) => mockGetDashboardLayout(...args),
  saveDashboardLayout: (...args: unknown[]) => mockSaveDashboardLayout(...args),
}));

const { default: dashboardRoutes } = await import('./dashboard.routes.js');

describe('dashboard routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(projectScope);
    await app.register(dashboardRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/dashboard/layout', () => {
    it('returns layout for project', async () => {
      mockGetDashboardLayout.mockReturnValue({
        widgets: [
          {
            id: 'ext:widget',
            extensionName: 'ext',
            widgetId: 'widget',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/layout',
        headers: { 'x-renrekit-project': '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.widgets).toHaveLength(1);
      expect(body.widgets[0].id).toBe('ext:widget');
      expect(mockGetDashboardLayout).toHaveBeenCalledWith('/my/project');
    });

    it('returns empty layout when no project', async () => {
      mockGetDashboardLayout.mockReturnValue({ widgets: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/layout',
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.widgets).toEqual([]);
    });
  });

  describe('PUT /api/dashboard/layout', () => {
    it('saves layout', async () => {
      const layout = {
        widgets: [
          {
            id: 'ext:widget',
            extensionName: 'ext',
            widgetId: 'widget',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/dashboard/layout',
        headers: { 'x-renrekit-project': '/my/project' },
        payload: layout,
      });
      expect(response.statusCode).toBe(200);
      expect(mockSaveDashboardLayout).toHaveBeenCalledWith('/my/project', layout);
    });

    it('returns 400 without project', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/dashboard/layout',
        payload: { widgets: [] },
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
