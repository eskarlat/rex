import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionCard } from './ExtensionCard';
import type { Extension } from '@/core/hooks/use-extensions';

const mockInstallMutate = vi.fn();
const mockActivateMutate = vi.fn();
const mockDeactivateMutate = vi.fn();
const mockRemoveMutate = vi.fn();

vi.mock('@/core/hooks/use-extensions', () => ({
  useInstallExtension: () => ({
    mutate: mockInstallMutate,
    isPending: false,
  }),
  useActivateExtension: () => ({
    mutate: mockActivateMutate,
    isPending: false,
  }),
  useDeactivateExtension: () => ({
    mutate: mockDeactivateMutate,
    isPending: false,
  }),
  useRemoveExtension: () => ({
    mutate: mockRemoveMutate,
    isPending: false,
  }),
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders extension name, version badge, and type badge', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('standard')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.getByText('A test extension')).toBeInTheDocument();
  });

  it('shows "No description available." when description is missing', () => {
    const noDesc: Extension = {
      name: baseExtension.name,
      version: baseExtension.version,
      type: baseExtension.type,
      status: baseExtension.status,
    };
    renderWithProviders(
      <ExtensionCard extension={noDesc} />
    );
    expect(
      screen.getByText('No description available.')
    ).toBeInTheDocument();
  });

  it('shows author when provided', () => {
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, author: 'Jane Doe' }}
      />
    );
    expect(screen.getByText('By Jane Doe')).toBeInTheDocument();
  });

  it('does not show author section when author is not provided', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(screen.queryByText(/^By /)).not.toBeInTheDocument();
  });

  // Available status
  it('shows Install button for available extensions', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    expect(
      screen.getByRole('button', { name: 'Install' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Uninstall' })).not.toBeInTheDocument();
  });

  it('clicking Install calls install.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    await user.click(screen.getByRole('button', { name: 'Install' }));
    expect(mockInstallMutate).toHaveBeenCalledWith({ name: 'test-ext' });
  });

  // Installed status
  it('shows Activate and Uninstall buttons for installed extensions', () => {
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, status: 'installed' }}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Activate' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Uninstall' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
  });

  it('clicking Activate calls activate.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, status: 'installed' }}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Activate' }));
    expect(mockActivateMutate).toHaveBeenCalledWith({ name: 'test-ext', version: '1.0.0' });
  });

  it('clicking Uninstall calls remove.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, status: 'installed' }}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Uninstall' }));
    expect(mockRemoveMutate).toHaveBeenCalledWith('test-ext');
  });

  // Active status
  it('shows Deactivate button for active extensions', () => {
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, status: 'active' }}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Deactivate' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Uninstall' })).not.toBeInTheDocument();
  });

  it('renders tag badges when tags are provided', () => {
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, tags: ['example', 'utility'] }}
      />
    );
    expect(screen.getByText('example')).toBeInTheDocument();
    expect(screen.getByText('utility')).toBeInTheDocument();
  });

  it('does not render tag section when tags are empty', () => {
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, tags: [] }}
      />
    );
    expect(screen.queryByText('example')).not.toBeInTheDocument();
  });

  it('does not render tag section when tags are undefined', () => {
    renderWithProviders(<ExtensionCard extension={baseExtension} />);
    // No tag badges should be rendered - the card should still render fine
    expect(screen.getByText('test-ext')).toBeInTheDocument();
  });

  it('clicking Deactivate calls deactivate.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExtensionCard
        extension={{ ...baseExtension, status: 'active' }}
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Deactivate' })
    );
    expect(mockDeactivateMutate).toHaveBeenCalledWith('test-ext');
  });
});
