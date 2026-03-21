export interface InterExtensionEvent {
  type: string;
  source: string;
  data: Record<string, unknown>;
  timestamp: string;
}

type EventListener = (event: InterExtensionEvent) => void;

const MAX_BUFFER_SIZE = 500;

const buffer: InterExtensionEvent[] = [];
const listeners = new Set<EventListener>();

export function publishEvent(event: Omit<InterExtensionEvent, 'timestamp'>): void {
  const full: InterExtensionEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (buffer.length >= MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE + 1);
  }
  buffer.push(full);

  for (const fn of listeners) {
    fn(full);
  }
}

export function subscribeEvents(fn: EventListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getRecentEvents(limit = 50): InterExtensionEvent[] {
  return buffer.slice(-limit).map((e) => ({ ...e, data: { ...e.data } }));
}

export function matchesPattern(pattern: string, eventType: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === eventType;

  const parts = pattern.split('*');
  const prefix = parts[0] ?? '';
  const suffix = parts[parts.length - 1] ?? '';

  return (!prefix || eventType.startsWith(prefix)) && (!suffix || eventType.endsWith(suffix));
}

/** Reset all state — for testing only. */
export function _reset(): void {
  buffer.length = 0;
  listeners.clear();
}
