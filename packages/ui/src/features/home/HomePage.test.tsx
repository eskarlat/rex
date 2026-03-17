import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './HomePage';

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: {
      active: [
        { name: 'ext1', version: '1.0.0', type: 'standard', status: 'active' },
        { name: 'ext2', version: '2.0.0', type: 'mcp-stdio', status: 'active' },
      ],
      installed: [],
      available: [],
    },
    isLoading: false,
  }),
}));

vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({
    activeProject: '/home/user/my-project',
    setActiveProject: vi.fn(),
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

describe('HomePage', () => {
  it('renders dashboard heading', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows active project path', () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByText('Project: /home/user/my-project')
    ).toBeInTheDocument();
  });

  it('shows active extensions count', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders quick action cards', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getByText('Vault')).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
