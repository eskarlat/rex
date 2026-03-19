import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

vi.mock('./DynamicWidget', () => ({
  DynamicWidget: ({ extensionName, widgetId }: { extensionName: string; widgetId: string }) => (
    <div data-testid={`dynamic-widget-${extensionName}-${widgetId}`} />
  ),
}));

import { WidgetCard } from './WidgetCard';

interface RenderOptions {
  onRemove?: () => void;
  onResize?: (newSize: { w: number; h: number }) => void;
  size?: { w: number; h: number };
  constraints?: {
    minSize?: { w: number; h: number };
    maxSize?: { w: number; h: number };
  };
}

function renderCard(opts: RenderOptions = {}) {
  return render(
    <MemoryRouter>
      <WidgetCard
        id="hello-world:status"
        extensionName="hello-world"
        widgetId="status"
        title="Hello Status"
        size={opts.size ?? { w: 4, h: 2 }}
        constraints={opts.constraints}
        onRemove={opts.onRemove ?? vi.fn()}
        onResize={opts.onResize}
      />
    </MemoryRouter>,
  );
}

describe('WidgetCard', () => {
  it('renders widget title', () => {
    renderCard();
    expect(screen.getByText('Hello Status')).toBeInTheDocument();
  });

  it('renders DynamicWidget with correct props', () => {
    renderCard();
    expect(screen.getByTestId('dynamic-widget-hello-world-status')).toBeInTheDocument();
  });

  it('calls onRemove on remove button click', () => {
    const onRemove = vi.fn();
    renderCard({ onRemove });
    fireEvent.click(screen.getByTestId('remove-widget'));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('has drag handle element', () => {
    renderCard();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });
});

describe('WidgetCard resize', () => {
  it('shows grow and shrink buttons when onResize is provided', () => {
    renderCard({ onResize: vi.fn() });
    expect(screen.getByTestId('grow-widget')).toBeInTheDocument();
    expect(screen.getByTestId('shrink-widget')).toBeInTheDocument();
  });

  it('does not show resize buttons when onResize is not provided', () => {
    renderCard();
    expect(screen.queryByTestId('grow-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shrink-widget')).not.toBeInTheDocument();
  });

  it('grow increases size by 1 in each dimension', () => {
    const onResize = vi.fn();
    renderCard({ size: { w: 4, h: 2 }, onResize });
    fireEvent.click(screen.getByTestId('grow-widget'));
    expect(onResize).toHaveBeenCalledWith({ w: 5, h: 3 });
  });

  it('shrink decreases size by 1 in each dimension', () => {
    const onResize = vi.fn();
    renderCard({ size: { w: 4, h: 3 }, onResize });
    fireEvent.click(screen.getByTestId('shrink-widget'));
    expect(onResize).toHaveBeenCalledWith({ w: 3, h: 2 });
  });
});

describe('WidgetCard min/max constraints', () => {
  it('disables grow when at max size', () => {
    renderCard({
      size: { w: 6, h: 4 },
      constraints: { maxSize: { w: 6, h: 4 } },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('grow-widget')).toBeDisabled();
  });

  it('disables shrink when at min size', () => {
    renderCard({
      size: { w: 3, h: 2 },
      constraints: { minSize: { w: 3, h: 2 } },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('shrink-widget')).toBeDisabled();
  });

  it('enables grow when below max size', () => {
    renderCard({
      size: { w: 4, h: 2 },
      constraints: { maxSize: { w: 6, h: 4 } },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('grow-widget')).not.toBeDisabled();
  });

  it('enables shrink when above min size', () => {
    renderCard({
      size: { w: 5, h: 3 },
      constraints: { minSize: { w: 3, h: 2 } },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('shrink-widget')).not.toBeDisabled();
  });

  it('clamps grow to max size', () => {
    const onResize = vi.fn();
    renderCard({
      size: { w: 5, h: 3 },
      constraints: { maxSize: { w: 6, h: 3 } },
      onResize,
    });
    fireEvent.click(screen.getByTestId('grow-widget'));
    expect(onResize).toHaveBeenCalledWith({ w: 6, h: 3 });
  });

  it('clamps shrink to min size', () => {
    const onResize = vi.fn();
    renderCard({
      size: { w: 4, h: 3 },
      constraints: { minSize: { w: 3, h: 3 } },
      onResize,
    });
    fireEvent.click(screen.getByTestId('shrink-widget'));
    expect(onResize).toHaveBeenCalledWith({ w: 3, h: 3 });
  });

  it('both buttons enabled when size is between min and max', () => {
    renderCard({
      size: { w: 4, h: 3 },
      constraints: { minSize: { w: 3, h: 2 }, maxSize: { w: 6, h: 4 } },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('grow-widget')).not.toBeDisabled();
    expect(screen.getByTestId('shrink-widget')).not.toBeDisabled();
  });

  it('no constraints means both buttons always enabled', () => {
    renderCard({
      size: { w: 4, h: 2 },
      onResize: vi.fn(),
    });
    expect(screen.getByTestId('grow-widget')).not.toBeDisabled();
    expect(screen.getByTestId('shrink-widget')).not.toBeDisabled();
  });
});
