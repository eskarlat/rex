import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockDestroy = vi.fn();
const mockSetToastHandler = vi.fn();
const mockSetNavigateHandler = vi.fn();

vi.mock('@renre-kit/extension-sdk', () => ({
  RenreKitSDKImpl: vi.fn().mockImplementation(() => ({
    ui: {
      setToastHandler: mockSetToastHandler,
      setNavigateHandler: mockSetNavigateHandler,
    },
    destroy: mockDestroy,
  })),
}));

vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({ activeProject: '/mock/project' }),
}));

vi.mock('@/core/hooks/use-toast', () => ({
  showToast: vi.fn(),
}));

import { useExtensionSDK } from './use-extension-sdk';

beforeEach(() => {
  vi.clearAllMocks();
});

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return createElement(MemoryRouter, null, children);
}

describe('useExtensionSDK', () => {
  it('creates SDK instance with extension name and project', () => {
    const { result } = renderHook(() => useExtensionSDK('my-ext'), { wrapper });
    expect(result.current).toBeDefined();
    expect(mockSetToastHandler).toHaveBeenCalled();
    expect(mockSetNavigateHandler).toHaveBeenCalled();
  });

  it('calls destroy on unmount', () => {
    const { unmount } = renderHook(() => useExtensionSDK('my-ext'), { wrapper });
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
