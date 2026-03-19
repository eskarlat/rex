import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MobileSidebarProvider } from '@/core/providers/MobileSidebarProvider';
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

const mockMarketplace = vi.fn();
vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => mockMarketplace(),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MobileSidebarProvider>
        <TooltipProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </TooltipProvider>
      </MobileSidebarProvider>
    </QueryClientProvider>
  );
}

describe('Sidebar', () => {
  it('renders brand name', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('RenreKit')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows active extensions in sidebar', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          { name: 'hello-world', version: '1.0.0', type: 'standard', status: 'active' },
          { name: 'echo-mcp', version: 'dev', type: 'mcp', status: 'active' },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getByText('hello-world')).toBeInTheDocument();
    expect(screen.getByText('echo-mcp')).toBeInTheDocument();
  });

  it('shows extension title when available instead of name', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          { name: 'hello-world', version: '1.0.0', type: 'standard', status: 'active', title: 'Hello World' },
          { name: 'echo-mcp', version: 'dev', type: 'mcp', status: 'active' },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByText('hello-world')).not.toBeInTheDocument();
    expect(screen.getByText('echo-mcp')).toBeInTheDocument();
  });

  it('hides extensions section when none are active', () => {
    mockMarketplace.mockReturnValue({
      data: { active: [], installed: [], available: [] },
    });
    renderWithProviders(<Sidebar />);
    expect(screen.queryByText('Extensions')).not.toBeInTheDocument();
  });

  it('renders collapse button', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<Sidebar />);
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });

  it('hides labels and brand when collapsed', async () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<Sidebar />);

    const collapseBtn = screen.getByRole('button', { name: 'Collapse sidebar' });
    await userEvent.click(collapseBtn);

    expect(screen.queryByText('RenreKit')).not.toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Scheduler')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('restores labels and brand when expanded again', async () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<Sidebar />);

    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));

    expect(screen.getByText('RenreKit')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
