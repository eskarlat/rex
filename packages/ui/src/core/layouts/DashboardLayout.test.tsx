import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/features/navigation/Sidebar', () => ({
  AppSidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/features/navigation/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

vi.mock('@/features/terminal/use-terminal', () => ({
  TerminalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTerminal: () => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    send: vi.fn(),
    registerSender: vi.fn(),
    unregisterSender: vi.fn(),
  }),
}));

vi.mock('@/features/terminal/TerminalDrawer', () => ({
  TerminalDrawer: () => null,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('DashboardLayout', () => {
  it('renders sidebar', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders toolbar', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders outlet content', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });
});
