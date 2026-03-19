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

describe('MarketplacePage', () => {
  it('renders marketplace heading', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
  });

  it('shows tab counts', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByText('Active (1)')).toBeInTheDocument();
    expect(screen.getByText('Installed (1)')).toBeInTheDocument();
    expect(screen.getByText('Available (0)')).toBeInTheDocument();
  });

  it('shows active extensions by default', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByText('active-ext')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.getByPlaceholderText('Search extensions...')).toBeInTheDocument();
  });

  it('does not show tag chips when no available extensions have tags', () => {
    renderWithProviders(<MarketplacePage />);
    expect(screen.queryByTestId('tag-filter')).not.toBeInTheDocument();
  });
});

describe('MarketplacePage with tags and available extensions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows tag filter and available extensions', async () => {
    vi.doMock('@/core/hooks/use-extensions', () => ({
      useMarketplace: () => ({
        data: {
          active: [],
          installed: [],
          available: [
            {
              name: 'avail-ext',
              version: '1.0.0',
              type: 'standard',
              status: 'available',
              description: 'Available one',
              tags: ['automation', 'tools'],
            },
            {
              name: 'avail-ext-2',
              version: '2.0.0',
              type: 'standard',
              status: 'available',
              description: 'Another available',
              tags: ['tools'],
            },
          ],
        },
        isLoading: false,
      }),
      useInstallExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useActivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useDeactivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useRemoveExtension: () => ({ mutate: vi.fn(), isPending: false }),
      useUpdateExtension: () => ({ mutate: vi.fn(), isPending: false }),
    }));

    const { MarketplacePage: TagPage } = await import('./MarketplacePage');
    const { default: userEvent } = await import('@testing-library/user-event');
    const { within } = await import('@testing-library/react');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TagPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Tag filter should appear
    const tagFilter = screen.getByTestId('tag-filter');
    expect(tagFilter).toBeInTheDocument();
    expect(within(tagFilter).getByText('automation')).toBeInTheDocument();
    expect(within(tagFilter).getByText('tools')).toBeInTheDocument();

    // Switch to Available tab to render available extensions
    await userEvent.click(screen.getByText(/^Available/));
    expect(screen.getByText('avail-ext')).toBeInTheDocument();
    expect(screen.getByText('avail-ext-2')).toBeInTheDocument();

    // Click the automation tag badge in the tag filter to filter
    await userEvent.click(within(tagFilter).getByText('automation'));
    // After filtering, only avail-ext should match (it has the 'automation' tag)
    expect(screen.getByText('avail-ext')).toBeInTheDocument();

    // Click same tag again to deselect
    await userEvent.click(within(tagFilter).getByText('automation'));
    expect(screen.getByText('avail-ext-2')).toBeInTheDocument();
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

    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    // When loading, skeletons are rendered instead of tabs
    expect(screen.queryByText('Active (0)')).not.toBeInTheDocument();
  });
});
