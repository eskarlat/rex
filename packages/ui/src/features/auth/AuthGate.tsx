import { useEffect, useState, type ReactNode } from 'react';
import { fetchApi, onAuthFailure } from '@/core/api/client';
import { PinPrompt } from './PinPrompt';

interface AuthStatusResponse {
  lanMode: boolean;
  authenticated: boolean;
}

type AuthState = 'loading' | 'authenticated' | 'pin_required';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    fetchApi<AuthStatusResponse>('/api/auth/status')
      .then((data) => {
        if (data.lanMode && !data.authenticated) {
          setAuthState('pin_required');
        } else {
          setAuthState('authenticated');
        }
      })
      .catch(() => {
        // Status endpoint not available (LAN mode disabled) or network error — proceed
        setAuthState('authenticated');
      });
  }, []);

  useEffect(() => {
    return onAuthFailure(() => {
      setAuthState('pin_required');
    });
  }, []);

  return (
    <>
      {authState === 'pin_required' && (
        <PinPrompt onSuccess={() => setAuthState('authenticated')} />
      )}
      {authState === 'authenticated' && children}
    </>
  );
}
