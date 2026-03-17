import { useState, useEffect, useCallback } from 'react';
import { useSDK } from '../context/SDKProvider';

export function useStorage(key: string): [string | null, (value: string) => Promise<void>] {
  const sdk = useSDK();
  const [storedValue, setStoredValue] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void sdk.storage.get(key).then((v) => {
      if (!cancelled) {
        setStoredValue(v);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sdk, key]);

  const setValue = useCallback(
    async (newValue: string): Promise<void> => {
      await sdk.storage.set(key, newValue);
      setStoredValue(newValue);
    },
    [sdk, key],
  );

  return [storedValue, setValue];
}
