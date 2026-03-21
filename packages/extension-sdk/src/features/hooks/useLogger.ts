import { useSDK } from '../context/SDKProvider';
import type { LoggerAPI } from '../../core/types';

export function useLogger(): LoggerAPI {
  const sdk = useSDK();
  return sdk.logger;
}
