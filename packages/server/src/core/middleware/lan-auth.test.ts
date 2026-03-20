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
    // Static asset routes for testing non-API passthrough
    app.get('/', () => {
      return 'root';
    });
    app.get('/index.html', () => {
      return 'html content';
    });
    app.get('/assets/main.js', () => {
      return 'js content';
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

  it('strips query strings when checking API paths', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/test?foo=bar',
      cookies: { 'renrekit-pin': TEST_PIN },
    });
    expect(response.statusCode).toBe(200);
  });

  it('allows non-API routes through without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/index.html',
    });
    expect(response.statusCode).toBe(200);
  });

  it('allows root path through without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(200);
  });

  it('allows static asset paths through without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/assets/main.js',
    });
    expect(response.statusCode).toBe(200);
  });

  describe('GET /api/auth/status', () => {
    it('returns authenticated false when no PIN cookie is set', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/status',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ lanMode: true, authenticated: false });
    });

    it('returns authenticated true when valid PIN cookie is set', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/status',
        cookies: { 'renrekit-pin': TEST_PIN },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ lanMode: true, authenticated: true });
    });

    it('returns authenticated false when invalid PIN cookie is set', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/status',
        cookies: { 'renrekit-pin': '9999' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ lanMode: true, authenticated: false });
    });
  });
});
