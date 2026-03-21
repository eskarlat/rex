import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { publishEvent, subscribeEvents, matchesPattern } from '../../core/utils/event-hub.js';
import type { InterExtensionEvent } from '../../core/utils/event-hub.js';

interface SocketLike {
  send(data: string): void;
  on(event: string, listener: (data: unknown) => void): void;
}

interface PublishBody {
  type?: string;
  source?: string;
  data?: Record<string, unknown>;
}

interface WsIncoming {
  action: string;
  event?: { type?: string; source?: string; data?: Record<string, unknown> };
  patterns?: string[];
}

export function handleWsPublish(msg: WsIncoming): void {
  if (msg.event?.type && msg.event?.source) {
    publishEvent({
      type: msg.event.type,
      source: msg.event.source,
      data: msg.event.data ?? {},
    });
  }
}

export function handleWsSubscribe(
  msg: WsIncoming,
  state: { patterns: string[]; unsubscribe: (() => void) | null },
  handleEvent: (event: InterExtensionEvent) => void,
): void {
  if (Array.isArray(msg.patterns)) {
    state.patterns = msg.patterns;
    if (!state.unsubscribe) {
      state.unsubscribe = subscribeEvents(handleEvent);
    }
  }
}

export function handleWsUnsubscribe(state: { patterns: string[]; unsubscribe: (() => void) | null }): void {
  state.patterns = [];
  if (state.unsubscribe) {
    state.unsubscribe();
    state.unsubscribe = null;
  }
}

const eventsWebsocket: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  // REST endpoint: POST /api/events — publish an event
  fastify.post('/api/events', (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as PublishBody;
    if (!body.type || !body.source) {
      return reply.code(400).send({ error: 'type and source are required' });
    }

    publishEvent({
      type: body.type,
      source: body.source,
      data: body.data ?? {},
    });

    return reply.code(204).send();
  });

  // WebSocket: /api/events — subscribe to events
  fastify.get('/api/events', { websocket: true }, (socket: SocketLike) => {
    const state: { patterns: string[]; unsubscribe: (() => void) | null } = {
      patterns: [],
      unsubscribe: null,
    };

    function handleEvent(event: InterExtensionEvent): void {
      if (state.patterns.length === 0) return;
      const matched = state.patterns.some((p) => matchesPattern(p, event.type));
      if (matched) {
        try {
          socket.send(JSON.stringify({ action: 'event', event }));
        } catch {
          // Socket may be closed; cleanup will happen via onclose
        }
      }
    }

    socket.on('message', (raw: unknown) => {
      let msg: WsIncoming;
      try {
        msg = JSON.parse(String(raw)) as WsIncoming;
      } catch {
        return;
      }

      if (msg.action === 'publish') handleWsPublish(msg);
      else if (msg.action === 'subscribe') handleWsSubscribe(msg, state, handleEvent);
      else if (msg.action === 'unsubscribe') handleWsUnsubscribe(state);
    });

    socket.on('close', () => {
      handleWsUnsubscribe(state);
    });
  });

  done();
};

export default eventsWebsocket;
