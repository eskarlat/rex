import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionActions, UpdateBadge } from './ExtensionActions';
import type { Extension } from '@/core/hooks/use-extensions';

const mockInstallMutate = vi.fn();
const mockActivateMutate = vi.fn();
const mockDeactivateMutate = vi.fn();
const mockRemoveMutate = vi.fn();
const mockUpdateMutate = vi.fn();

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
  useUpdateExtension: () => ({
    mutate: mockUpdateMutate,
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
    </QueryClientProvider>,
  );
}

describe('ExtensionActions', () => {
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

  it('shows Install button for available extensions', () => {
    renderWithProviders(<ExtensionActions extension={baseExtension} />);
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
  });

  it('clicking Install calls install.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExtensionActions extension={baseExtension} />);
    await user.click(screen.getByRole('button', { name: 'Install' }));
    expect(mockInstallMutate).toHaveBeenCalledWith({ name: 'test-ext' });
  });

  it('shows Activate and Uninstall buttons for installed extensions', () => {
    renderWithProviders(<ExtensionActions extension={{ ...baseExtension, status: 'installed' }} />);
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uninstall' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
  });

  it('clicking Activate calls activate.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExtensionActions extension={{ ...baseExtension, status: 'installed' }} />);
    await user.click(screen.getByRole('button', { name: 'Activate' }));
    expect(mockActivateMutate).toHaveBeenCalledWith({
      name: 'test-ext',
      version: '1.0.0',
    });
  });

  it('clicking Uninstall calls remove.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExtensionActions extension={{ ...baseExtension, status: 'installed' }} />);
    await user.click(screen.getByRole('button', { name: 'Uninstall' }));
    expect(mockRemoveMutate).toHaveBeenCalledWith('test-ext');
  });

  it('shows Deactivate button for active extensions', () => {
    renderWithProviders(<ExtensionActions extension={{ ...baseExtension, status: 'active' }} />);
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
  });

  it('clicking Deactivate calls deactivate.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExtensionActions extension={{ ...baseExtension, status: 'active' }} />);
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(mockDeactivateMutate).toHaveBeenCalledWith('test-ext');
  });

  it('shows Update button when update is available and compatible', () => {
    renderWithProviders(
      <ExtensionActions
        extension={{
          ...baseExtension,
          status: 'active',
          updateAvailable: '2.0.0',
          engineCompatible: true,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('clicking Update calls update.mutate without force', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExtensionActions
        extension={{
          ...baseExtension,
          status: 'installed',
          updateAvailable: '2.0.0',
          engineCompatible: true,
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(mockUpdateMutate).toHaveBeenCalledWith({ name: 'test-ext' });
  });

  it('shows Force Update button when engine is incompatible', () => {
    renderWithProviders(
      <ExtensionActions
        extension={{
          ...baseExtension,
          status: 'active',
          updateAvailable: '2.0.0',
          engineCompatible: false,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Force Update' })).toBeInTheDocument();
  });

  it('clicking Force Update calls update.mutate with force', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExtensionActions
        extension={{
          ...baseExtension,
          status: 'installed',
          updateAvailable: '2.0.0',
          engineCompatible: false,
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Force Update' }));
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      name: 'test-ext',
      force: true,
    });
  });
});

describe('UpdateBadge', () => {
  const baseExtension: Extension = {
    name: 'test-ext',
    version: '1.0.0',
    type: 'standard',
    status: 'active',
  };

  it('renders nothing when no update available', () => {
    const { container } = renderWithProviders(
      <UpdateBadge extension={{ ...baseExtension, updateAvailable: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows available badge for compatible update', () => {
    renderWithProviders(
      <UpdateBadge
        extension={{
          ...baseExtension,
          updateAvailable: '2.0.0',
          engineCompatible: true,
        }}
      />,
    );
    expect(screen.getByText('2.0.0 available')).toBeInTheDocument();
  });

  it('shows incompatible badge for incompatible update', () => {
    renderWithProviders(
      <UpdateBadge
        extension={{
          ...baseExtension,
          updateAvailable: '2.0.0',
          engineCompatible: false,
        }}
      />,
    );
    expect(screen.getByText('2.0.0 (incompatible)')).toBeInTheDocument();
  });
});
