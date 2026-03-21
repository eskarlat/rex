import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toolbar } from './Toolbar';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

const mockMarketplace = vi.fn();
vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => mockMarketplace(),
}));

const mockToggle = vi.fn();
let mockIsTerminalOpen = false;
vi.mock('@/features/terminal/use-terminal', () => ({
  useTerminal: () => ({
    isOpen: mockIsTerminalOpen,
    open: vi.fn(),
    close: vi.fn(),
    toggle: mockToggle,
    send: vi.fn(),
    registerSender: vi.fn(),
    unregisterSender: vi.fn(),
  }),
}));

function renderToolbar(route = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <SidebarProvider defaultOpen={true}>
          <Toolbar />
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>,
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

  it('shows settings/extensions/:name breadcrumb', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/settings/extensions/my-ext']}>
          <SidebarProvider defaultOpen={true}>
            <Routes>
              <Route path="/settings/extensions/:name" element={<Toolbar />} />
            </Routes>
          </SidebarProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('my-ext')).toBeInTheDocument();
  });

  it('shows extensions/:name breadcrumb with fallback label', () => {
    mockMarketplace.mockReturnValue({
      data: { active: [], installed: [], available: [] },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/extensions/hello-world']}>
          <SidebarProvider defaultOpen={true}>
            <Routes>
              <Route path="/extensions/:name" element={<Toolbar />} />
            </Routes>
          </SidebarProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('hello-world')).toBeInTheDocument();
  });

  it('shows extensions/:name/:panelId breadcrumb with panel title', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'my-ext',
            title: 'My Extension',
            panels: [{ id: 'settings', title: 'Settings Panel' }],
          },
        ],
        installed: [],
        available: [],
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/extensions/my-ext/settings']}>
          <SidebarProvider defaultOpen={true}>
            <Routes>
              <Route path="/extensions/:name/:panelId" element={<Toolbar />} />
            </Routes>
          </SidebarProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('My Extension')).toBeInTheDocument();
    expect(screen.getByText('Settings Panel')).toBeInTheDocument();
  });

  it('shows extensions/:name/:panelId with fallback panelId when panel not found', () => {
    mockMarketplace.mockReturnValue({
      data: { active: [{ name: 'my-ext', panels: [] }], installed: [], available: [] },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/extensions/my-ext/unknown']}>
          <SidebarProvider defaultOpen={true}>
            <Routes>
              <Route path="/extensions/:name/:panelId" element={<Toolbar />} />
            </Routes>
          </SidebarProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('my-ext')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('renders Terminal button', () => {
    renderToolbar('/');
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  it('renders Terminal button with active style when terminal is open', () => {
    mockIsTerminalOpen = true;
    renderToolbar('/');
    const terminalButton = screen.getByLabelText('Close terminal');
    expect(terminalButton).toBeInTheDocument();
    mockIsTerminalOpen = false;
  });

  it('calls toggle when Terminal button is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    renderToolbar('/');
    const terminalButton = screen.getByText('Terminal');
    await userEvent.click(terminalButton);
    expect(mockToggle).toHaveBeenCalledOnce();
  });
});
