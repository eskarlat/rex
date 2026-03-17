import { useState, useCallback } from 'react';
import { useSDK } from '../context/SDKProvider';

export interface UseCommandReturn {
  run: (command: string, args?: Record<string, unknown>) => Promise<void>;
  output: string | null;
  isRunning: boolean;
  error: Error | null;
}

export function useCommand(): UseCommandReturn {
  const sdk = useSDK();
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async (command: string, args?: Record<string, unknown>): Promise<void> => {
      setIsRunning(true);
      setError(null);
      setOutput(null);
      try {
        const result = await sdk.exec.run(command, args);
        setOutput(result.output);
      } catch (err: unknown) {
        const wrapped =
          err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
      } finally {
        setIsRunning(false);
      }
    },
    [sdk],
  );

  return { run, output, isRunning, error };
}
