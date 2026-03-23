import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMarketplaceData = vi.fn();

vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => ({
    data: mockMarketplaceData(),
    isLoading: false,
  }),
}));

import { WidgetPicker } from './WidgetPicker';

const fullMarketplace = {
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
};

beforeEach(() => {
  mockMarketplaceData.mockReturnValue(fullMarketplace);
});

function renderPicker(onAdd = vi.fn(), addedWidgetIds = new Set<string>()) {
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

  it('shows empty message when no widgets are available', () => {
    mockMarketplaceData.mockReturnValue({ active: [], installed: [], available: [] });
    renderPicker();
    expect(screen.getByText(/no widgets available/i)).toBeInTheDocument();
  });

  it('handles extensions without title by using name', () => {
    mockMarketplaceData.mockReturnValue({
      active: [
        {
          name: 'no-title-ext',
          version: '1.0.0',
          type: 'standard',
          status: 'active',
          widgets: [{ id: 'w1', title: 'Widget One', defaultSize: { w: 3, h: 2 } }],
        },
      ],
      installed: [],
      available: [],
    });
    renderPicker();
    expect(screen.getByText('no-title-ext')).toBeInTheDocument();
  });

  it('handles extensions without widgets array', () => {
    mockMarketplaceData.mockReturnValue({
      active: [{ name: 'no-widgets', version: '1.0.0', type: 'standard', status: 'active' }],
      installed: [],
      available: [],
    });
    renderPicker();
    expect(screen.getByText(/no widgets available/i)).toBeInTheDocument();
  });

  it('handles null marketplace data', () => {
    mockMarketplaceData.mockReturnValue(undefined);
    renderPicker();
    expect(screen.getByText(/no widgets available/i)).toBeInTheDocument();
  });
});
