import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsLayout } from './SettingsLayout';

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: {
      active: [
        {
          name: 'hello-world',
          version: 'dev',
          type: 'standard',
          status: 'active',
          hasConfig: true,
        },
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
    </QueryClientProvider>,
  );
}

describe('SettingsLayout', () => {
  it('renders Settings heading', () => {
    renderWithProviders();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your RenreKit configuration.')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders();
    // Both mobile and desktop navs render the links
    expect(screen.getAllByText('General').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Registries').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Vault').length).toBeGreaterThanOrEqual(1);
  });

  it('renders active extensions in settings nav', () => {
    renderWithProviders();
    // Desktop nav shows "Extensions" label
    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getAllByText('hello-world').length).toBeGreaterThanOrEqual(1);
  });

  it('links point to correct routes', () => {
    renderWithProviders();
    // Use the first matching link for assertions (both mobile and desktop have correct hrefs)
    const generalLinks = screen.getAllByText('General');
    const registriesLinks = screen.getAllByText('Registries');
    const extLinks = screen.getAllByText('hello-world');

    expect(generalLinks[0]!.closest('a')).toHaveAttribute('href', '/settings');
    expect(registriesLinks[0]!.closest('a')).toHaveAttribute('href', '/settings/registries');
    expect(extLinks[0]!.closest('a')).toHaveAttribute(
      'href',
      '/settings/extensions/hello-world',
    );
  });
});
