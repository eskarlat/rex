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
    data: {
      active: [
        {
          name: 'ext',
          widgets: [
            {
              id: 'w1',
              title: 'Widget 1',
              defaultSize: { w: 4, h: 2 },
              minSize: { w: 2, h: 1 },
              maxSize: { w: 6, h: 4 },
            },
            { id: 'w2', title: 'Widget 2', defaultSize: { w: 4, h: 2 } },
          ],
        },
      ],
      installed: [],
      available: [],
    },
    isLoading: false,
  }),
}));

vi.mock('./WidgetCard', () => ({
  WidgetCard: ({
    id,
    title,
    onRemove,
    onResize,
    size,
    constraints,
  }: {
    id: string;
    title: string;
    onRemove: () => void;
    onResize: (newSize: { w: number; h: number }) => void;
    size: { w: number; h: number };
    constraints?: { minSize?: { w: number; h: number }; maxSize?: { w: number; h: number } };
  }) => (
    <div data-testid={`widget-card-${id}`}>
      <span>{title}</span>
      <span data-testid={`size-${id}`}>
        {size.w}x{size.h}
      </span>
      {constraints?.minSize && (
        <span data-testid={`min-${id}`}>
          {constraints.minSize.w}x{constraints.minSize.h}
        </span>
      )}
      {constraints?.maxSize && (
        <span data-testid={`max-${id}`}>
          {constraints.maxSize.w}x{constraints.maxSize.h}
        </span>
      )}
      <button data-testid={`remove-${id}`} onClick={onRemove}>
        Remove
      </button>
      <button data-testid={`resize-${id}`} onClick={() => onResize({ w: 5, h: 3 })}>
        Resize
      </button>
    </div>
  ),
}));

let capturedOnAdd:
  | ((extensionName: string, widgetId: string, defaultSize: { w: number; h: number }) => void)
  | undefined;

vi.mock('./WidgetPicker', () => ({
  WidgetPicker: ({
    onAdd,
  }: {
    onAdd: (extensionName: string, widgetId: string, defaultSize: { w: number; h: number }) => void;
  }) => {
    capturedOnAdd = onAdd;
    return null;
  },
}));

let capturedOnDragEnd:
  | ((event: { active: { id: string }; over: { id: string } | null }) => void)
  | undefined;

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd: (event: { active: { id: string }; over: { id: string } | null }) => void;
  }) => {
    capturedOnDragEnd = onDragEnd;
    return <div>{children}</div>;
  },
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
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
          {
            id: 'ext:w2',
            extensionName: 'ext',
            widgetId: 'w2',
            position: { x: 4, y: 0 },
            size: { w: 4, h: 2 },
          },
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
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
          {
            id: 'ext:w2',
            extensionName: 'ext',
            widgetId: 'w2',
            position: { x: 4, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    fireEvent.click(screen.getByTestId('remove-ext:w1'));
    expect(mockMutate).toHaveBeenCalledWith({
      widgets: [
        {
          id: 'ext:w2',
          extensionName: 'ext',
          widgetId: 'w2',
          position: { x: 4, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    });
  });

  it('resize callback updates widget size and saves', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    fireEvent.click(screen.getByTestId('resize-ext:w1'));
    expect(mockMutate).toHaveBeenCalledWith({
      widgets: [
        {
          id: 'ext:w1',
          extensionName: 'ext',
          widgetId: 'w1',
          position: { x: 0, y: 0 },
          size: { w: 5, h: 3 },
        },
      ],
    });
  });

  it('passes constraints from marketplace for widgets with minSize/maxSize', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.getByTestId('min-ext:w1')).toHaveTextContent('2x1');
    expect(screen.getByTestId('max-ext:w1')).toHaveTextContent('6x4');
  });

  it('does not pass constraints for widgets without minSize/maxSize', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w2',
            extensionName: 'ext',
            widgetId: 'w2',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.queryByTestId('min-ext:w2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('max-ext:w2')).not.toBeInTheDocument();
  });

  it('handleDragEnd reorders widgets when dragged to a new position', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
          {
            id: 'ext:w2',
            extensionName: 'ext',
            widgetId: 'w2',
            position: { x: 4, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    capturedOnDragEnd?.({ active: { id: 'ext:w1' }, over: { id: 'ext:w2' } });
    expect(mockMutate).toHaveBeenCalledWith({
      widgets: [
        {
          id: 'ext:w2',
          extensionName: 'ext',
          widgetId: 'w2',
          position: { x: 4, y: 0 },
          size: { w: 4, h: 2 },
        },
        {
          id: 'ext:w1',
          extensionName: 'ext',
          widgetId: 'w1',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    });
  });

  it('handleDragEnd does nothing when over is null', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    mockMutate.mockClear();
    capturedOnDragEnd?.({ active: { id: 'ext:w1' }, over: null });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('handleDragEnd does nothing when dragged to same position', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    mockMutate.mockClear();
    capturedOnDragEnd?.({ active: { id: 'ext:w1' }, over: { id: 'ext:w1' } });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('handleDragEnd does nothing when widget id not found', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    mockMutate.mockClear();
    capturedOnDragEnd?.({ active: { id: 'ext:w1' }, over: { id: 'nonexistent' } });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('handleAddWidget adds a widget placement and saves', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: { widgets: [] },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    mockMutate.mockClear();
    capturedOnAdd?.('ext', 'w1', { w: 4, h: 2 });
    expect(mockMutate).toHaveBeenCalledWith({
      widgets: [
        {
          id: 'ext:w1',
          extensionName: 'ext',
          widgetId: 'w1',
          position: { x: 0, y: 0 },
          size: { w: 4, h: 2 },
        },
      ],
    });
  });

  it('hides widgets from deactivated extensions', () => {
    vi.mocked(useDashboardLayout).mockReturnValue({
      data: {
        widgets: [
          {
            id: 'ext:w1',
            extensionName: 'ext',
            widgetId: 'w1',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 2 },
          },
          {
            id: 'deactivated-ext:w1',
            extensionName: 'deactivated-ext',
            widgetId: 'w1',
            position: { x: 4, y: 0 },
            size: { w: 4, h: 2 },
          },
        ],
      },
    } as ReturnType<typeof useDashboardLayout>);
    renderGrid();
    expect(screen.getByTestId('widget-card-ext:w1')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-card-deactivated-ext:w1')).not.toBeInTheDocument();
  });
});
