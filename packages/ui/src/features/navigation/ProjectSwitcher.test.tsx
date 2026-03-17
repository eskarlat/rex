import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectSwitcher } from './ProjectSwitcher';

vi.mock('@/core/hooks/use-projects', () => ({
  useProjects: () => ({
    data: [
      { name: 'project-a', path: '/path/a', created_at: '' },
      { name: 'project-b', path: '/path/b', created_at: '' },
    ],
    isLoading: false,
  }),
  useSetActiveProject: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({
    activeProject: '/path/a',
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

describe('ProjectSwitcher', () => {
  it('renders project selector', () => {
    renderWithProviders(<ProjectSwitcher />);
    expect(screen.getByRole('combobox', { name: /select project/i })).toBeInTheDocument();
  });

  it('shows the current project name', () => {
    renderWithProviders(<ProjectSwitcher />);
    expect(screen.getByText('project-a')).toBeInTheDocument();
  });
});
