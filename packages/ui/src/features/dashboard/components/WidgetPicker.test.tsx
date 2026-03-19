import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: {
      active: [
        {
          name: 'hello-world',
          title: 'Hello World',
          version: '1.0.0',
          type: 'standard',
          status: 'active',
          widgets: [
            { id: 'status', title: 'Status Widget', defaultSize: { w: 4, h: 2 } },
            { id: 'metrics', title: 'Metrics Widget', defaultSize: { w: 6, h: 3 } },
          ],
        },
      ],
      installed: [],
      available: [],
    },
    isLoading: false,
  }),
}));

import { WidgetPicker } from './WidgetPicker';

function renderPicker(
  onAdd = vi.fn(),
  addedWidgetIds = new Set<string>(),
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <WidgetPicker
          open={true}
          onOpenChange={vi.fn()}
          onAdd={onAdd}
          addedWidgetIds={addedWidgetIds}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WidgetPicker', () => {
  it('shows dialog when open', () => {
    renderPicker();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('lists available widgets from active extensions', () => {
    renderPicker();
    expect(screen.getByText('Status Widget')).toBeInTheDocument();
    expect(screen.getByText('Metrics Widget')).toBeInTheDocument();
  });

  it('disables already-added widgets', () => {
    renderPicker(vi.fn(), new Set(['hello-world:status']));
    const addedButton = screen.getByText('Added');
    expect(addedButton).toBeInTheDocument();
    expect(addedButton.closest('button')).toBeDisabled();
  });

  it('calls onAdd with extensionName, widgetId, defaultSize', () => {
    const onAdd = vi.fn();
    renderPicker(onAdd);
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]!);
    expect(onAdd).toHaveBeenCalledWith('hello-world', 'status', { w: 4, h: 2 });
  });
});
