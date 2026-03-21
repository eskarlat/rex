import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SDKProvider, useSDK } from './SDKProvider';
import type { RenreKitSDK } from '../../core/types';

function createMockSDK(): RenreKitSDK {
  return {
    project: {
      name: 'test',
      path: '/test',
      config: {},
      refresh: vi.fn(),
    },
    exec: { run: vi.fn() },
    storage: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
    ui: {
      toast: vi.fn(),
      confirm: vi.fn(),
      navigate: vi.fn(),
    },
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      publish: vi.fn(),
    },
    scheduler: {
      list: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      update: vi.fn(),
    },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    notify: vi.fn(),
    destroy: vi.fn(),
  };
}

describe('SDKProvider', () => {
  it('renders children', () => {
    const sdk = createMockSDK();
    const { result } = renderHook(() => useSDK(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SDKProvider sdk={sdk}>{children}</SDKProvider>
      ),
    });
    expect(result.current).toBe(sdk);
  });

  it('useSDK returns SDK instance from context', () => {
    const sdk = createMockSDK();
    const { result } = renderHook(() => useSDK(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SDKProvider sdk={sdk}>{children}</SDKProvider>
      ),
    });
    expect(result.current.project.name).toBe('test');
    expect(result.current.exec.run).toBeDefined();
  });

  it('useSDK throws when used outside provider', () => {
    let caughtError: unknown = null;

    function TestComponent(): null {
      try {
        useSDK();
      } catch (err: unknown) {
        caughtError = err;
      }
      return null;
    }

    renderHook(() => {
      try {
        useSDK();
      } catch (err: unknown) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toBe('useSDK must be used within an SDKProvider');
  });
});
