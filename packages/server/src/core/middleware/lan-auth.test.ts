import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import lanAuth from './lan-auth.js';

describe('lan-auth middleware', () => {
  let app: FastifyInstance;
  const TEST_PIN = '1234';

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    app = Fastify();
    await app.register(cookie);
    await app.register(lanAuth, { pin: TEST_PIN });
    app.get('/api/test', () => {
      return { ok: true };
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it('returns 401 when no PIN cookie is set', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/test',
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'PIN required' });
  });

  it('returns 401 for invalid PIN', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/pin',
      payload: { pin: '0000' },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Invalid PIN' });
  });

  it('sets cookie on valid PIN submission', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/pin',
      payload: { pin: TEST_PIN },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('allows requests with valid PIN cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/test',
      cookies: { 'renrekit-pin': TEST_PIN },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it('rejects requests with invalid PIN cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/test',
      cookies: { 'renrekit-pin': '9999' },
    });
    expect(response.statusCode).toBe(401);
  });

  it('allows PIN submission endpoint without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/pin',
      payload: { pin: TEST_PIN },
    });
    // Should not return 401 for PIN endpoint itself
    expect(response.statusCode).toBe(200);
  });
});
