import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegistriesPage } from './RegistriesPage';

const mockAddMutate = vi.fn((_data: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});
const mockRemoveMutate = vi.fn();
const mockSyncMutate = vi.fn();

let mockRegistriesData: {
  data: Array<{
    name: string;
    url: string;
    priority: number;
    last_synced?: string;
  }> | undefined;
  isLoading: boolean;
};
let mockAddPending = false;

vi.mock('@/core/hooks/use-registries', () => ({
  useRegistries: () => mockRegistriesData,
  useAddRegistry: () => ({ mutate: mockAddMutate, isPending: mockAddPending }),
  useRemoveRegistry: () => ({ mutate: mockRemoveMutate, isPending: false }),
  useSyncRegistry: () => ({ mutate: mockSyncMutate, isPending: false }),
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

describe('RegistriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddPending = false;
    mockRegistriesData = {
      data: [
        {
          name: 'main',
          url: 'https://github.com/reg',
          priority: 0,
          last_synced: '2024-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
    };
  });

  it('renders heading and subtext', () => {
    renderWithProviders(<RegistriesPage />);
    expect(screen.getByText('Registries')).toBeInTheDocument();
    expect(
      screen.getByText('Manage extension registries.')
    ).toBeInTheDocument();
  });

  it('shows registry data in table', () => {
    renderWithProviders(<RegistriesPage />);
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/reg')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows Add Registry button', () => {
    renderWithProviders(<RegistriesPage />);
    expect(
      screen.getByRole('button', { name: 'Add Registry' })
    ).toBeInTheDocument();
  });

  it('opens dialog and submits form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistriesPage />);

    await user.click(screen.getByRole('button', { name: 'Add Registry' }));

    expect(screen.getByText('Add a new extension registry source.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'my-registry');
    await user.type(
      screen.getByLabelText('URL'),
      'https://github.com/user/registry'
    );
    await user.clear(screen.getByLabelText('Priority'));
    await user.type(screen.getByLabelText('Priority'), '5');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(mockAddMutate).toHaveBeenCalledWith(
      { name: 'my-registry', url: 'https://github.com/user/registry', priority: 5 },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('Sync button calls syncRegistry.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistriesPage />);

    await user.click(screen.getByRole('button', { name: 'Sync' }));
    expect(mockSyncMutate).toHaveBeenCalledWith('main');
  });

  it('Remove button calls removeRegistry.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegistriesPage />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(mockRemoveMutate).toHaveBeenCalledWith('main');
  });

  it('shows empty state when no registries', () => {
    mockRegistriesData = { data: [], isLoading: false };
    renderWithProviders(<RegistriesPage />);
    expect(
      screen.getByText('No registries configured.')
    ).toBeInTheDocument();
  });

  it('shows empty state when registries is undefined', () => {
    mockRegistriesData = { data: undefined, isLoading: false };
    renderWithProviders(<RegistriesPage />);
    expect(
      screen.getByText('No registries configured.')
    ).toBeInTheDocument();
  });

  it('shows "Never" when last_synced is undefined', () => {
    mockRegistriesData = {
      data: [
        {
          name: 'new-reg',
          url: 'https://example.com',
          priority: 1,
          last_synced: undefined,
        },
      ],
      isLoading: false,
    };
    renderWithProviders(<RegistriesPage />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading', () => {
    mockRegistriesData = { data: undefined, isLoading: true };
    renderWithProviders(<RegistriesPage />);
    expect(screen.getByText('Registries')).toBeInTheDocument();
    expect(screen.queryByText('Add Registry')).not.toBeInTheDocument();
  });
});
