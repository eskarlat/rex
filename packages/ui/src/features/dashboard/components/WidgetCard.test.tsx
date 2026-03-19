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

function renderCard(onRemove = vi.fn()) {
  return render(
    <MemoryRouter>
      <WidgetCard
        id="hello-world:status"
        extensionName="hello-world"
        widgetId="status"
        title="Hello Status"
        size={{ w: 4, h: 2 }}
        onRemove={onRemove}
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
    renderCard(onRemove);
    fireEvent.click(screen.getByTestId('remove-widget'));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('has drag handle element', () => {
    renderCard();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });
});
