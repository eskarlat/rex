import { useEffect } from 'react';
import { useSDK } from '../context/SDKProvider';
import type { SDKEventType, SDKEventHandler } from '../../core/types';

export function useEvents(event: SDKEventType, handler: SDKEventHandler): void {
  const sdk = useSDK();

  useEffect(() => {
    sdk.events.on(event, handler);
    return () => {
      sdk.events.off(event, handler);
    };
  }, [sdk, event, handler]);
}
