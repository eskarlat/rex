import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionCard } from './ExtensionCard';
import type { Extension } from '@/core/hooks/use-extensions';

const mockInstall = vi.fn();
const mockActivate = vi.fn();
const mockDeactivate = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/core/hooks/use-extensions', () => ({
  useInstallExtension: () => ({ mutate: mockInstall, isPending: false }),
  useActivateExtension: () => ({ mutate: mockActivate, isPending: false }),
  useDeactivateExtension: () => ({ mutate: mockDeactivate, isPending: false }),
  useRemoveExtension: () => ({ mutate: mockRemove, isPending: false }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ExtensionCard', () => {
  const baseExtension: Extension = {
    name: 'test-ext',
    version: '1.0.0',
    type: 'standard',
    description: 'A test extension',
    status: 'available',
  };

  it('renders extension name and version', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('shows Install button for available extensions', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('calls install on click', async () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    await userEvent.click(screen.getByText('Install'));
    expect(mockInstall).toHaveBeenCalledWith({ name: 'test-ext' });
  });

  it('shows Activate and Remove for installed extensions', () => {
    renderWithProviders(
      <ExtensionCard extension={{ ...baseExtension, status: 'installed' }} />
    );
    expect(screen.getByText('Activate')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('shows Deactivate for active extensions', () => {
    renderWithProviders(
      <ExtensionCard extension={{ ...baseExtension, status: 'active' }} />
    );
    expect(screen.getByText('Deactivate')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.getByText('A test extension')).toBeInTheDocument();
  });
});
