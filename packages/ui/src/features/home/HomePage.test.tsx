import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './HomePage';

vi.mock('@/features/dashboard/components/WidgetGrid', () => ({
  WidgetGrid: () => <div data-testid="widget-grid" />,
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
    </QueryClientProvider>,
  );
}

describe('HomePage', () => {
  it('renders dashboard heading', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows active project path', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Project: /home/user/my-project')).toBeInTheDocument();
  });

  it('renders WidgetGrid', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('widget-grid')).toBeInTheDocument();
  });
});

describe('HomePage no project', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows "No project selected" when no active project', async () => {
    vi.doMock('@/core/providers/ProjectProvider', () => ({
      useProjectContext: () => ({
        activeProject: null,
        setActiveProject: vi.fn(),
      }),
    }));

    const { HomePage: NoProjectPage } = await import('./HomePage');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NoProjectPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('No project selected')).toBeInTheDocument();
  });
});
