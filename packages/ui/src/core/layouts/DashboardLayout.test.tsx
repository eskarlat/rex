import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

vi.mock('@/features/navigation/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/features/navigation/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
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
      </MemoryRouter>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders toolbar', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders outlet content', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });
});
