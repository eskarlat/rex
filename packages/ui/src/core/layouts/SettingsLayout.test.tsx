import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsLayout } from './SettingsLayout';

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: {
      active: [
        { name: 'hello-world', version: 'dev', type: 'standard', status: 'active', hasConfig: true },
      ],
      installed: [],
      available: [],
    },
  }),
}));

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsLayout />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SettingsLayout', () => {
  it('renders Settings heading', () => {
    renderWithProviders();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your RenreKit configuration.')
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Registries')).toBeInTheDocument();
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  it('renders active extensions in settings nav', () => {
    renderWithProviders();
    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getByText('hello-world')).toBeInTheDocument();
  });

  it('links point to correct routes', () => {
    renderWithProviders();
    const generalLink = screen.getByText('General').closest('a');
    const registriesLink = screen.getByText('Registries').closest('a');
    const extLink = screen.getByText('hello-world').closest('a');

    expect(generalLink).toHaveAttribute('href', '/settings');
    expect(registriesLink).toHaveAttribute('href', '/settings/registries');
    expect(extLink).toHaveAttribute('href', '/settings/extensions/hello-world');
  });
});
