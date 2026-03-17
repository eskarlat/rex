import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaultPage } from './VaultPage';

const mockSetMutate = vi.fn((_data: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});
const mockRemoveMutate = vi.fn();

vi.mock('@/core/hooks/use-vault', () => ({
  useVaultEntries: () => ({
    data: [
      {
        key: 'GITHUB_TOKEN',
        tags: ['github', 'api'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
      {
        key: 'NPM_TOKEN',
        tags: ['npm'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      },
    ],
    isLoading: false,
  }),
  useSetVaultEntry: () => ({ mutate: mockSetMutate, isPending: false }),
  useRemoveVaultEntry: () => ({ mutate: mockRemoveMutate, isPending: false }),
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

describe('VaultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vault heading', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithProviders(<VaultPage />);
    expect(
      screen.getByText('Manage encrypted secrets and keys.'),
    ).toBeInTheDocument();
  });

  it('shows vault entries in the table', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('GITHUB_TOKEN')).toBeInTheDocument();
    expect(screen.getByText('NPM_TOKEN')).toBeInTheDocument();
  });

  it('masks secret values with asterisks', () => {
    renderWithProviders(<VaultPage />);
    const maskedValues = screen.getAllByText('******');
    expect(maskedValues).toHaveLength(2);
  });

  it('shows tags for vault entries', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('github, api')).toBeInTheDocument();
    expect(screen.getByText('npm')).toBeInTheDocument();
  });

  it('has an Add Entry button', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('Add Entry')).toBeInTheDocument();
  });

  it('shows Delete buttons for each entry', () => {
    renderWithProviders(<VaultPage />);
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls removeEntry.mutate with the correct key when Delete is clicked', async () => {
    renderWithProviders(<VaultPage />);
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]!);
    expect(mockRemoveMutate).toHaveBeenCalledWith('GITHUB_TOKEN');
  });

  it('calls removeEntry.mutate for the second entry', async () => {
    renderWithProviders(<VaultPage />);
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[1]!);
    expect(mockRemoveMutate).toHaveBeenCalledWith('NPM_TOKEN');
  });

  it('opens Add Entry dialog when button is clicked', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    expect(screen.getByText('Add Vault Entry')).toBeInTheDocument();
    expect(
      screen.getByText('Store a new encrypted secret in the vault.'),
    ).toBeInTheDocument();
  });

  it('dialog contains Key, Value, and Tags inputs', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    expect(screen.getByLabelText('Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Value')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags (comma-separated)')).toBeInTheDocument();
  });

  it('Save button is disabled when key and value are empty', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('Save button is enabled when key and value are filled', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    await userEvent.type(screen.getByLabelText('Key'), 'MY_KEY');
    await userEvent.type(screen.getByLabelText('Value'), 'my_value');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();
  });

  it('submits the form with tags parsed from comma-separated input', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    await userEvent.type(screen.getByLabelText('Key'), 'NEW_SECRET');
    await userEvent.type(screen.getByLabelText('Value'), 'secret123');
    await userEvent.type(
      screen.getByLabelText('Tags (comma-separated)'),
      'tag1, tag2',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockSetMutate).toHaveBeenCalledWith(
      { key: 'NEW_SECRET', value: 'secret123', secret: true, tags: ['tag1', 'tag2'] },
      expect.anything(),
    );
  });

  it('submits the form without tags when tags input is empty', async () => {
    renderWithProviders(<VaultPage />);
    await userEvent.click(screen.getByText('Add Entry'));
    await userEvent.type(screen.getByLabelText('Key'), 'NO_TAGS_KEY');
    await userEvent.type(screen.getByLabelText('Value'), 'value123');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockSetMutate).toHaveBeenCalledWith(
      { key: 'NO_TAGS_KEY', value: 'value123', secret: true, tags: undefined },
      expect.anything(),
    );
  });

  it('renders table headers', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});

describe('VaultPage loading state', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('shows skeleton when loading', async () => {
    vi.doMock('@/core/hooks/use-vault', () => ({
      useVaultEntries: () => ({
        data: undefined,
        isLoading: true,
      }),
      useSetVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
      useRemoveVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
    }));

    const { VaultPage: LoadingVaultPage } = await import('./VaultPage');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoadingVaultPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Vault')).toBeInTheDocument();
    // Should not show the table or Add Entry button
    expect(screen.queryByText('Add Entry')).not.toBeInTheDocument();
  });
});

describe('VaultPage empty state', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('shows empty state when no entries', async () => {
    vi.doMock('@/core/hooks/use-vault', () => ({
      useVaultEntries: () => ({
        data: [],
        isLoading: false,
      }),
      useSetVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
      useRemoveVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
    }));

    const { VaultPage: EmptyVaultPage } = await import('./VaultPage');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EmptyVaultPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('No vault entries found.')).toBeInTheDocument();
  });
});
