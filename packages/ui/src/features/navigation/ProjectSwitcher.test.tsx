import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
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

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter>
          <SidebarProvider defaultOpen={true}>{ui}</SidebarProvider>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('ProjectSwitcher', () => {
  it('renders brand name and current project', () => {
    renderWithProviders(<ProjectSwitcher />);
    expect(screen.getByText('RenreKit')).toBeInTheDocument();
    expect(screen.getByText('project-a')).toBeInTheDocument();
  });

  it('renders dropdown trigger with aria label', () => {
    renderWithProviders(<ProjectSwitcher />);
    expect(screen.getByRole('button', { name: /select project/i })).toBeInTheDocument();
  });

  it('opens dropdown and shows all projects', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectSwitcher />);
    await user.click(screen.getByRole('button', { name: /select project/i }));
    expect(screen.getByRole('menuitem', { name: 'project-a' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'project-b' })).toBeInTheDocument();
  });

  it('calls setActiveProject and mutate when selecting a project', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectSwitcher />);
    await user.click(screen.getByRole('button', { name: /select project/i }));
    await user.click(screen.getByRole('menuitem', { name: 'project-b' }));
    expect(mockSetActiveProject).toHaveBeenCalledWith('/path/b');
    expect(mockMutate).toHaveBeenCalledWith('/path/b');
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

    vi.doMock('@/hooks/use-mobile', () => ({
      useIsMobile: () => false,
    }));

    const { ProjectSwitcher: LoadingProjectSwitcher } = await import('./ProjectSwitcher');
    const { SidebarProvider: SP } = await import('@/components/ui/sidebar');

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter>
            <SP defaultOpen={true}>
              <LoadingProjectSwitcher />
            </SP>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // When loading, it shows a skeleton instead of the dropdown
    expect(screen.queryByRole('button', { name: /select project/i })).not.toBeInTheDocument();
  });
});
