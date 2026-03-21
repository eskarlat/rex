import { useState, useCallback } from 'react';
import { useSDK } from '../context/SDKProvider';
import type { CommandResult } from '../../core/types';

export interface UseCommandReturn {
  execute: (args?: Record<string, unknown>) => Promise<void>;
  result: CommandResult | null;
  loading: boolean;
  error: Error | null;
}

export function useCommand(extensionName: string, commandName: string): UseCommandReturn {
  const sdk = useSDK();
  const [result, setResult] = useState<CommandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (args?: Record<string, unknown>): Promise<void> => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const commandResult = await sdk.exec.run(`${extensionName}:${commandName}`, args);
        setResult(commandResult);
      } catch (err: unknown) {
        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
      } finally {
        setLoading(false);
      }
    },
    [sdk, extensionName, commandName],
  );

  return { execute, result, loading, error };
}
