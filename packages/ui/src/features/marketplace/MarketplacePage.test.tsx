import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarketplacePage } from './MarketplacePage';

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: {
      active: [
        {
          name: 'active-ext',
          version: '1.0.0',
          type: 'standard',
          status: 'active',
          description: 'An active extension',
        },
      ],
      installed: [
        {
          name: 'installed-ext',
          version: '2.0.0',
          type: 'mcp-stdio',
          status: 'installed',
          description: 'An installed extension',
        },
      ],
      available: [],
    },
    isLoading: false,
  }),
  useInstallExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useActivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useExtensionChangelog: () => ({ data: null, isLoading: false }),
  useExtensionReadme: () => ({ data: null, isLoading: false }),
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

describe('MarketplacePage', () => {
  it('renders sidebar with extension list', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByTestId('extension-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('ext-item-active-ext')).toBeInTheDocument();
    expect(screen.getByTestId('ext-item-installed-ext')).toBeInTheDocument();
  });

  it('renders search input in sidebar', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByPlaceholderText('Search extensions...')).toBeInTheDocument();
  });

  it('auto-selects first extension and shows detail panel', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    // First extension is active-ext — description appears in detail panel
    expect(screen.getByText('An active extension')).toBeInTheDocument();
  });

  it('renders section headers with counts', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Installed')).toBeInTheDocument();
  });
});

describe('MarketplacePage loading', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows loading skeleton when isLoading', async () => {
    vi.doMock('@/core/hooks/use-extensions', () => ({
      useMarketplace: () => ({ data: undefined, isLoading: true }),
      useInstallExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useActivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useDeactivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useRemoveExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useUpdateExtension: () => ({ mutate: vi.fn(), isPending: false }),
    }));

    const { MarketplacePage: LoadingPage } = await import('./MarketplacePage');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoadingPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // When loading, sidebar is not rendered
    expect(screen.queryByTestId('extension-sidebar')).not.toBeInTheDocument();
  });
});
