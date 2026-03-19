import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectSwitcher } from './ProjectSwitcher';

const mockSetActiveProject = vi.fn();
const mockMutate = vi.fn();

vi.mock('@/core/hooks/use-projects', () => ({
  useProjects: () => ({
    data: [
      { name: 'project-a', path: '/path/a', created_at: '' },
      { name: 'project-b', path: '/path/b', created_at: '' },
    ],
    isLoading: false,
  }),
  useSetActiveProject: () => ({ mutate: mockMutate, isPending: false }),
}));

vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({
    activeProject: '/path/a',
    setActiveProject: mockSetActiveProject,
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

  it('renders combobox with correct aria label', () => {
    renderWithProviders(<ProjectSwitcher />);
    const trigger = screen.getByRole('combobox', { name: /select project/i });
    expect(trigger).toBeInTheDocument();
  });

  it('exposes the select trigger with value from active project', () => {
    renderWithProviders(<ProjectSwitcher />);
    // The current active project name should be shown in the trigger
    expect(screen.getByText('project-a')).toBeInTheDocument();
    // Verify both mock functions are available (handleChange calls them)
    expect(mockSetActiveProject).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});

describe('ProjectSwitcher loading state', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows loading skeleton when loading', async () => {
    vi.doMock('@/core/hooks/use-projects', () => ({
      useProjects: () => ({
        data: undefined,
        isLoading: true,
      }),
      useSetActiveProject: () => ({ mutate: vi.fn(), isPending: false }),
    }));
    vi.doMock('@/core/providers/ProjectProvider', () => ({
      useProjectContext: () => ({
        activeProject: null,
        setActiveProject: vi.fn(),
      }),
    }));

    const { ProjectSwitcher: LoadingProjectSwitcher } = await import('./ProjectSwitcher');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoadingProjectSwitcher />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // When loading, it shows a skeleton instead of the select
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
