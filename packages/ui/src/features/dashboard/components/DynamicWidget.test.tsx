import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DynamicWidget } from './DynamicWidget';

vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({
    activeProject: '/mock/project',
    setActiveProject: vi.fn(),
  }),
}));

vi.mock('@/core/hooks/use-extension-sdk', () => ({
  useExtensionSDK: () => ({
    project: { name: null, path: null, config: {} },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    destroy: vi.fn(),
  }),
}));

function renderWidget(name: string, widgetId: string) {
  return render(
    <MemoryRouter>
      <DynamicWidget extensionName={name} widgetId={widgetId} />
    </MemoryRouter>,
  );
}

describe('DynamicWidget', () => {
  it('renders container on load', () => {
    const { container } = renderWidget('test-ext', 'status');
    expect(container).toBeDefined();
  });

  it('shows error when widget fails to load', async () => {
    renderWidget('nonexistent-ext', 'bad-widget');
    const errorMessage = await screen.findByText(
      /failed to load widget/i,
      {},
      { timeout: 3000 },
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
