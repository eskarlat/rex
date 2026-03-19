import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toolbar } from './Toolbar';

const mockMarketplace = vi.fn();
vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => mockMarketplace(),
}));

function renderToolbar(route = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Toolbar />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Toolbar', () => {
  beforeEach(() => {
    mockMarketplace.mockReturnValue({ data: undefined });
  });

  it('renders Home breadcrumb on root page', () => {
    renderToolbar('/');
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders Marketplace link on the right', () => {
    renderToolbar('/');
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
  });

  it('shows breadcrumb for scheduler page', () => {
    renderToolbar('/scheduler');
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
  });

  it('shows breadcrumb for logs page', () => {
    renderToolbar('/logs');
    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  it('shows breadcrumb for settings page', () => {
    renderToolbar('/settings');
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows nested breadcrumb for settings/registries', () => {
    renderToolbar('/settings/registries');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Registries')).toBeInTheDocument();
  });

  it('shows nested breadcrumb for settings/vault', () => {
    renderToolbar('/settings/vault');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  it('shows breadcrumb for marketplace page', () => {
    renderToolbar('/marketplace');
    expect(screen.getByText('Home')).toBeInTheDocument();
    // "Marketplace" appears both as breadcrumb and toolbar link
    expect(screen.getAllByText('Marketplace')).toHaveLength(2);
  });
});
