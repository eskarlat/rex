import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import errorHandler, { getStatusCode } from './error-handler.js';

describe('error-handler middleware', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(errorHandler);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns JSON error response with 500 for generic errors', async () => {
    app.get('/fail', () => {
      throw new Error('Something went wrong');
    });
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/fail' });
    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
  });

  it('maps known error codes to HTTP status codes', async () => {
    app.get('/not-found', () => {
      const err = new Error('Not found') as Error & { code: string };
      err.code = 'EXTENSION_NOT_FOUND';
      throw err;
    });
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/not-found' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Not found', code: 'EXTENSION_NOT_FOUND' });
  });

  it('uses statusCode from error if present', async () => {
    app.get('/bad-request', () => {
      const err = new Error('Bad request') as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    });
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/bad-request' });
    expect(response.statusCode).toBe(400);
  });

  it('maps MCP_TIMEOUT to 504', async () => {
    app.get('/timeout', () => {
      const err = new Error('Timeout') as Error & { code: string };
      err.code = 'MCP_TIMEOUT';
      throw err;
    });
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/timeout' });
    expect(response.statusCode).toBe(504);
  });
});

describe('getStatusCode', () => {
  it('returns 500 for unknown error codes', () => {
    const err = new Error('test') as Error & { code: string };
    err.code = 'UNKNOWN_CODE';
    expect(getStatusCode(err)).toBe(500);
  });

  it('returns 500 for errors without code', () => {
    expect(getStatusCode(new Error('test'))).toBe(500);
  });

  it('returns statusCode from error object', () => {
    const err = new Error('test') as Error & { statusCode: number };
    err.statusCode = 422;
    expect(getStatusCode(err)).toBe(422);
  });

  it('returns 400 for CONFIG_INVALID', () => {
    const err = new Error('test') as Error & { code: string };
    err.code = 'CONFIG_INVALID';
    expect(getStatusCode(err)).toBe(400);
  });

  it('returns 502 for MCP_SPAWN_FAILED', () => {
    const err = new Error('test') as Error & { code: string };
    err.code = 'MCP_SPAWN_FAILED';
    expect(getStatusCode(err)).toBe(502);
  });
});
