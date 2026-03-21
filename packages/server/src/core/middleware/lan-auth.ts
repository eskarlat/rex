import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

import { generatePin } from '../utils/pin-generator.js';

const COOKIE_NAME = 'renrekit-pin';
const COOKIE_MAX_AGE = 86400; // 24 hours in seconds

export interface LanAuthOptions {
  pin?: string; // allow injecting pin for tests
}

export default fp(
  (fastify: FastifyInstance, opts: LanAuthOptions, done: () => void) => {
    const pin = opts.pin ?? generatePin();

    fastify.post('/api/auth/pin', (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as Record<string, unknown> | null;
      const submitted = body?.pin;

      if (typeof submitted !== 'string' || submitted !== pin) {
        reply.code(401);
        return { error: 'Invalid PIN' };
      }

      void reply.setCookie(COOKIE_NAME, pin, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
      });

      return { ok: true };
    });

    // Auth status endpoint — always accessible so the UI can probe auth state
    fastify.get('/api/auth/status', (request: FastifyRequest) => {
      const cookiePin = request.cookies[COOKIE_NAME];
      return { lanMode: true, authenticated: cookiePin === pin };
    });

    fastify.addHook(
      'onRequest',
      (request: FastifyRequest, reply: FastifyReply, hookDone: () => void) => {
        const url = request.url.split('?')[0]!;

        // Allow non-API routes through (static assets, SPA fallback)
        if (!url.startsWith('/api/')) {
          hookDone();
          return;
        }

        // Allow auth endpoints through without authentication
        if (url === '/api/auth/pin' || url === '/api/auth/status') {
          hookDone();
          return;
        }

        const cookiePin = request.cookies[COOKIE_NAME];
        if (cookiePin !== pin) {
          reply.code(401);
          void reply.send({ error: 'PIN required' });
          return;
        }

        hookDone();
      },
    );

    done();
  },
  { name: 'lan-auth' },
);
