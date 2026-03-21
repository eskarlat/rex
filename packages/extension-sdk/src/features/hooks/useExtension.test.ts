import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useExtension } from './useExtension';
import type { RenreKitSDK } from '../../core/types';

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: 'test', path: '/test', config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), publish: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    notify: vi.fn(),
    destroy: vi.fn(),
  };
}

describe('useExtension', () => {
  it('returns the full SDK instance', () => {
    const sdk = createMockSDK();

    function wrapper({ children }: { children: ReactNode }): ReactNode {
      return createElement(SDKProvider, { sdk }, children);
    }

    const { result } = renderHook(() => useExtension(), { wrapper });
    expect(result.current).toBe(sdk);
  });

  it('provides access to all SDK capability groups', () => {
    const sdk = createMockSDK();

    function wrapper({ children }: { children: ReactNode }): ReactNode {
      return createElement(SDKProvider, { sdk }, children);
    }

    const { result } = renderHook(() => useExtension(), { wrapper });
    expect(result.current.project).toBeDefined();
    expect(result.current.exec).toBeDefined();
    expect(result.current.storage).toBeDefined();
    expect(result.current.ui).toBeDefined();
    expect(result.current.events).toBeDefined();
    expect(result.current.scheduler).toBeDefined();
    expect(result.current.destroy).toBeDefined();
  });
});
