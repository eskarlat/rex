import { useSDK } from '../context/SDKProvider';
import type { RenreKitSDK } from '../../core/types';

export function useExtension(): RenreKitSDK {
  return useSDK();
}
