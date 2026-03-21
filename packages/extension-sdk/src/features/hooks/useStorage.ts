import { useState, useEffect, useCallback } from 'react';

import { useSDK } from '../context/SDKProvider';
import type { StorageEntry } from '../../core/types';

export interface UseStorageReturn {
  data: Record<string, string> | null;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  loading: boolean;
}

export function useStorage(extensionName: string): UseStorageReturn {
  const sdk = useSDK();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void sdk.storage.list().then((entries: StorageEntry[]) => {
      if (cancelled) return;
      const prefix = `${extensionName}:`;
      const scoped: Record<string, string> = {};
      for (const entry of entries) {
        if (entry.key.startsWith(prefix)) {
          scoped[entry.key.slice(prefix.length)] = entry.value;
        }
      }
      setData(scoped);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sdk, extensionName]);

  const set = useCallback(
    async (key: string, value: string): Promise<void> => {
      const scopedKey = `${extensionName}:${key}`;
      await sdk.storage.set(scopedKey, value);
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [sdk, extensionName],
  );

  const remove = useCallback(
    async (key: string): Promise<void> => {
      const scopedKey = `${extensionName}:${key}`;
      await sdk.storage.delete(scopedKey);
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [sdk, extensionName],
  );

  return { data, set, remove, loading };
}
