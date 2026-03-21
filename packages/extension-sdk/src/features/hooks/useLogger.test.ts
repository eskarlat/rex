import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import type { RenreKitSDK, ExtensionLogger } from '../../core/types';
import { SDKProvider } from '../context/SDKProvider';
import { useLogger } from './useLogger';

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
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

describe('useLogger', () => {
  let mockSDK: RenreKitSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(SDKProvider, { sdk: mockSDK }, children);
  }

  it('returns the logger API from the SDK', () => {
    const { result } = renderHook(() => useLogger(), { wrapper });

    expect(result.current).toBe(mockSDK.logger);
  });

  it('exposes debug, info, warn, error methods', () => {
    const { result } = renderHook(() => useLogger(), { wrapper });
    const logger: ExtensionLogger = result.current;

    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('delegates calls to the SDK logger', () => {
    const { result } = renderHook(() => useLogger(), { wrapper });

    result.current.info('test message');

    expect(mockSDK.logger.info).toHaveBeenCalledWith('test message');
  });
});
