import { useSDK } from '../context/SDKProvider';
import type { ExtensionLogger } from '../../core/types';

export function useLogger(): ExtensionLogger {
  const sdk = useSDK();
  return sdk.logger;
}
