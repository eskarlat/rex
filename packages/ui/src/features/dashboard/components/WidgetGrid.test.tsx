import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutate = vi.fn();

vi.mock('@/core/hooks/use-dashboard-layout', () => ({
  useDashboardLayout: vi.fn(),
  useSaveDashboardLayout: () => ({ mutate: mockMutate }),
}));

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: { active: [], installed: [], available: [] },
    isLoading: false,
  }),
}));

vi.mock('./WidgetCard', () => ({
  WidgetCard: ({ id, title, onRemove }: { id: string; title: string; onRemove: () => void }) => (
    <div data-testid={`widget-card-${id}`}>
      <span>{title}</span>
      <button data-testid={`remove-${id}`} onClick={onRemove}>Remove</button>
    </div>
  ),
}));

vi.mock('./WidgetPicker', () => ({
  WidgetPicker: () => null,
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
  rectSortingStrategy: vi.fn(),
}));

import { useDashboardLayout } from '@/core/hooks/use-dashboard-layout';
import { WidgetGrid } from './WidgetGrid';

function renderGrid() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <WidgetGrid />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WidgetGrid', () => {
  it('renders empty state when no widgets', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: { widgets: [] },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No widgets yet/)).toBeInTheDocument();
  });

  it('renders WidgetCard for each widget', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          { id: 'ext:w1', extensionName: 'ext', widgetId: 'w1', position: { x: 0, y: 0 }, size: { w: 4, h: 2 } },
          { id: 'ext:w2', extensionName: 'ext', widgetId: 'w2', position: { x: 4, y: 0 }, size: { w: 4, h: 2 } },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.getByTestId('widget-card-ext:w1')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-ext:w2')).toBeInTheDocument();
  });

  it('shows "Add Widget" button', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: { widgets: [] },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('remove callback filters widget from layout and saves', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          { id: 'ext:w1', extensionName: 'ext', widgetId: 'w1', position: { x: 0, y: 0 }, size: { w: 4, h: 2 } },
          { id: 'ext:w2', extensionName: 'ext', widgetId: 'w2', position: { x: 4, y: 0 }, size: { w: 4, h: 2 } },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    fireEvent.click(screen.getByTestId('remove-ext:w1'));
    expect(mockMutate).toHaveBeenCalledWith({
      widgets: [
        { id: 'ext:w2', extensionName: 'ext', widgetId: 'w2', position: { x: 4, y: 0 }, size: { w: 4, h: 2 } },
      ],
    });
  });
});
