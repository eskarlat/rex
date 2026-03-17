import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RenreKitSDK } from '../../core/types';

const SDKContext = createContext<RenreKitSDK | null>(null);

export interface SDKProviderProps {
  sdk: RenreKitSDK;
  children: ReactNode;
}

export function SDKProvider({ sdk, children }: SDKProviderProps) {
  return <SDKContext value={sdk}>{children}</SDKContext>;
}

export function useSDK(): RenreKitSDK {
  const sdk = useContext(SDKContext);
  if (sdk === null) {
    throw new Error('useSDK must be used within an SDKProvider');
  }
  return sdk;
}
