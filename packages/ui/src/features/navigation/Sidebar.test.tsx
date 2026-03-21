import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';

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

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
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
      <TooltipProvider>
        <MemoryRouter>
          <SidebarProvider defaultOpen={true}>{ui}</SidebarProvider>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('AppSidebar', () => {
  it('renders brand name in header', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText('RenreKit')).toBeInTheDocument();
  });

  it('renders current project name in header', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText('my-project')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<AppSidebar />);
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
          { name: 'context7-mcp', version: 'dev', type: 'mcp', status: 'active' },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getByText('hello-world')).toBeInTheDocument();
    expect(screen.getByText('context7-mcp')).toBeInTheDocument();
  });

  it('shows extension title when available instead of name', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'hello-world',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            title: 'Hello World',
          },
          { name: 'context7-mcp', version: 'dev', type: 'mcp', status: 'active' },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByText('hello-world')).not.toBeInTheDocument();
    expect(screen.getByText('context7-mcp')).toBeInTheDocument();
  });

  it('shows extension icon when hasIcon is true', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'hello-world',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            hasIcon: true,
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<AppSidebar />);
    const link = screen.getByRole('link', { name: 'hello-world' });
    const img = link.querySelector('img');
    expect(img).toHaveAttribute('src', '/api/extensions/hello-world/icon');
  });

  it('hides extensions section when none are active', () => {
    mockMarketplace.mockReturnValue({
      data: { active: [], installed: [], available: [] },
    });
    renderWithProviders(<AppSidebar />);
    expect(screen.queryByText('Extensions')).not.toBeInTheDocument();
  });

  it('renders project switcher dropdown trigger', () => {
    mockMarketplace.mockReturnValue({ data: undefined });
    renderWithProviders(<AppSidebar />);
    expect(screen.getByRole('button', { name: /select project/i })).toBeInTheDocument();
  });
});
