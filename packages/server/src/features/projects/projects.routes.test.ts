import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from '../../core/middleware/project-scope.js';

const mockList = vi.fn();
const mockGet = vi.fn();

vi.mock('@renre-kit/cli/lib', () => ({
  ProjectManager: vi.fn().mockImplementation(() => ({
    list: mockList,
    get: mockGet,
  })),
  EventBus: vi.fn().mockImplementation(() => ({})),
}));

// Import after mock setup
const { default: projectsRoutes } = await import('./projects.routes.js');

describe('projects routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(projectScope);
    await app.register(projectsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/projects', () => {
    it('returns list of projects', async () => {
      const projects = [
        {
          id: 1,
          name: 'test',
          path: '/test',
          created_at: '2024-01-01',
          last_accessed_at: '2024-01-01',
        },
      ];
      mockList.mockReturnValue(projects);

      const response = await app.inject({ method: 'GET', url: '/api/projects' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(projects);
    });

    it('returns empty array when no projects', async () => {
      mockList.mockReturnValue([]);
      const response = await app.inject({ method: 'GET', url: '/api/projects' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });

  describe('PUT /api/projects/active', () => {
    it('sets active project', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/projects/active',
        payload: { projectPath: '/my/project' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true, projectPath: '/my/project' });
    });

    it('returns 400 when projectPath is missing', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/projects/active',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/project', () => {
    it('returns project details with header', async () => {
      const project = {
        id: 1,
        name: 'test',
        path: '/test',
        created_at: '2024-01-01',
        last_accessed_at: '2024-01-01',
      };
      mockGet.mockReturnValue(project);

      const response = await app.inject({
        method: 'GET',
        url: '/api/project',
        headers: { 'x-renrekit-project': '/test' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(project);
    });

    it('returns 404 when project not found', async () => {
      mockGet.mockReturnValue(null);
      const response = await app.inject({
        method: 'GET',
        url: '/api/project',
        headers: { 'x-renrekit-project': '/nonexistent' },
      });
      expect(response.statusCode).toBe(404);
    });

    it('returns 400 when no project selected', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/project',
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
