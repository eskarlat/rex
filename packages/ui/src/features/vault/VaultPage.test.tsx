import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaultPage } from './VaultPage';

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
  useSetVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateVaultEntry: () => ({ mutate: vi.fn(), isPending: false }),
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

describe('VaultPage', () => {
  it('renders vault heading', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  it('shows vault entries', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('GITHUB_TOKEN')).toBeInTheDocument();
    expect(screen.getByText('NPM_TOKEN')).toBeInTheDocument();
  });

  it('masks secret values', () => {
    renderWithProviders(<VaultPage />);
    const maskedValues = screen.getAllByText('******');
    expect(maskedValues).toHaveLength(2);
  });

  it('has an Add Entry button', () => {
    renderWithProviders(<VaultPage />);
    expect(screen.getByText('Add Entry')).toBeInTheDocument();
  });
});
