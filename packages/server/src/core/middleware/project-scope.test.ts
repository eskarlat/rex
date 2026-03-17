import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import projectScope from './project-scope.js';

describe('project-scope middleware', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(projectScope);
    app.get('/test', (request) => {
      return { projectPath: request.projectPath };
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('extracts X-RenreKit-Project header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-renrekit-project': '/my/project' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().projectPath).toBe('/my/project');
  });

  it('sets projectPath to undefined when header is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });
    expect(response.statusCode).toBe(200);
    // undefined is omitted from JSON serialization
    expect(response.json().projectPath).toBeUndefined();
  });

  it('sets projectPath to undefined when header is empty', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-renrekit-project': '' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().projectPath).toBeUndefined();
  });
});
