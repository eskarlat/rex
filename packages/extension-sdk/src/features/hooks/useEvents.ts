import { useState, useEffect, useCallback, useRef } from 'react';

import { useSDK } from '../context/SDKProvider';
import type { SDKEventType, SDKEventPayload } from '../../core/types';

export interface UseEventsReturn {
  lastEvent: SDKEventPayload | null;
  events: SDKEventPayload[];
}

export function useEvents(eventPattern: SDKEventType): UseEventsReturn {
  const sdk = useSDK();
  const [lastEvent, setLastEvent] = useState<SDKEventPayload | null>(null);
  const eventsRef = useRef<SDKEventPayload[]>([]);
  const [events, setEvents] = useState<SDKEventPayload[]>([]);

  const handler = useCallback((payload: SDKEventPayload) => {
    eventsRef.current = [...eventsRef.current, payload];
    setEvents(eventsRef.current);
    setLastEvent(payload);
  }, []);

  useEffect(() => {
    sdk.events.on(eventPattern, handler);
    return () => {
      sdk.events.off(eventPattern, handler);
    };
  }, [sdk, eventPattern, handler]);

  return { lastEvent, events };
}
