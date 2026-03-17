import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import projectScope from './core/middleware/project-scope.js';
import errorHandler from './core/middleware/error-handler.js';
import lanAuth from './core/middleware/lan-auth.js';
import projectsRoutes from './features/projects/projects.routes.js';
import extensionsRoutes from './features/extensions/extensions.routes.js';
import commandsRoutes from './features/commands/commands.routes.js';
import settingsRoutes from './features/settings/settings.routes.js';
import vaultRoutes from './features/vault/vault.routes.js';
import registriesRoutes from './features/registries/registries.routes.js';
import schedulerRoutes from './features/scheduler/scheduler.routes.js';
import logsWebsocket from './features/logs/logs.websocket.js';

export interface CreateServerOptions {
  lanMode?: boolean;
  lanPin?: string;
}

export async function createServer(opts: CreateServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false });

  // Core plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(cookie);
  await fastify.register(websocket);

  // Middleware
  await fastify.register(projectScope);
  await fastify.register(errorHandler);

  // LAN auth (only when enabled)
  if (opts.lanMode) {
    await fastify.register(lanAuth, { pin: opts.lanPin });
  }

  // Feature routes
  await fastify.register(projectsRoutes);
  await fastify.register(extensionsRoutes);
  await fastify.register(commandsRoutes);
  await fastify.register(settingsRoutes);
  await fastify.register(vaultRoutes);
  await fastify.register(registriesRoutes);
  await fastify.register(schedulerRoutes);
  await fastify.register(logsWebsocket);

  return fastify;
}
