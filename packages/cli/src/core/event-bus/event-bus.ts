import type { EventType, EventPayload } from '../types/index.js';

type EventHandler = (payload: EventPayload) => void | Promise<void>;
type BridgeFn = (event: string, payload: EventPayload) => void;

export class EventBus {
  private handlers = new Map<EventType, Set<EventHandler>>();
  private static bridgeFn: BridgeFn | null = null;

  static setBridge(fn: BridgeFn | null): void {
    EventBus.bridgeFn = fn;
  }

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
    if (set) {
      const promises: Promise<void>[] = [];
      for (const handler of set) {
        promises.push(
          Promise.resolve()
            .then(() => handler(payload))
            .catch((err: unknown) => {
              console.error(`[EventBus] Handler for "${event}" failed:`, err);
            }),
        );
      }
      await Promise.all(promises);
    }

    if (EventBus.bridgeFn) {
      try {
        EventBus.bridgeFn(event, payload);
      } catch {
        // Bridge errors don't affect local events
      }
    }
  }
}
