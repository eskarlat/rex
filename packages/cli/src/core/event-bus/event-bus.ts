import type { EventType, EventPayload } from '../types/index.js';

type EventHandler = (payload: EventPayload) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<EventType, Set<EventHandler>>();

  on(event: EventType, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: EventType, handler: EventHandler): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  async emit(event: EventType, payload: EventPayload): Promise<void> {
    const set = this.handlers.get(event);
    if (!set) {
      return;
    }

    const promises: Promise<void>[] = [];
    for (const handler of set) {
      promises.push(
        Promise.resolve()
          .then(() => handler(payload))
          .catch(() => {
            // Errors in handlers are swallowed to prevent propagation
          }),
      );
    }
    await Promise.all(promises);
  }
}
