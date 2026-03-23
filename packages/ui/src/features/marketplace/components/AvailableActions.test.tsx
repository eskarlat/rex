import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

vi.mock('@/core/api/client', () => ({
  getActiveProjectPath: () => null,
}));

vi.mock('@/core/hooks/use-toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/core/hooks/use-extensions', () => ({
  useActivateExtension: () => ({ mutate: vi.fn() }),
}));

const mockUseInstallProgress = vi.fn();
vi.mock('./InstallProgress', () => ({
  useInstallProgress: () => mockUseInstallProgress(),
  InstallProgressBar: ({ state }: { state: { step: string } }) =>
    createElement('div', { 'data-testid': 'progress-bar' }, state.step),
}));

import { AvailableActions } from './AvailableActions';

const ext = { name: 'my-ext', version: '1.0.0', type: 'standard' as const, status: 'available' as const };

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe('AvailableActions', () => {
  it('shows Install button in idle state', () => {
    mockUseInstallProgress.mockReturnValue({
      state: { step: 'idle', extensionName: null },
      startInstall: vi.fn(),
    });
    render(<AvailableActions extension={ext} />, { wrapper });
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('shows progress bar during installation', () => {
    mockUseInstallProgress.mockReturnValue({
      state: { step: 'downloading', extensionName: 'my-ext' },
      startInstall: vi.fn(),
    });
    render(<AvailableActions extension={ext} />, { wrapper });
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('shows Activate button after done', () => {
    mockUseInstallProgress.mockReturnValue({
      state: { step: 'done', extensionName: 'my-ext' },
      startInstall: vi.fn(),
    });
    render(<AvailableActions extension={ext} />, { wrapper });
    expect(screen.getByText('Activate')).toBeInTheDocument();
  });

  it('shows error state with Retry button', () => {
    mockUseInstallProgress.mockReturnValue({
      state: { step: 'error', extensionName: 'my-ext' },
      startInstall: vi.fn(),
    });
    render(<AvailableActions extension={ext} />, { wrapper });
    expect(screen.getByText('Install failed')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
