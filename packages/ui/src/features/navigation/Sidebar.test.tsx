import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';

vi.mock('@/core/hooks/use-projects', () => ({
  useProjects: () => ({
    data: [{ name: 'my-project', path: '/home/user/my-project', created_at: '' }],
    isLoading: false,
  }),
  useSetActiveProject: () => ({ mutate: vi.fn(), isPending: false }),
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

describe('Sidebar', () => {
  it('renders brand name', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('RenreKit')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Vault')).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
