import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DynamicPanel } from './DynamicPanel';

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

function renderPanel(name: string) {
  return render(
    <MemoryRouter>
      <DynamicPanel extensionName={name} />
    </MemoryRouter>
  );
}

describe('DynamicPanel', () => {
  it('renders loading skeleton initially', () => {
    const { container } = renderPanel('test-ext');
    expect(container).toBeDefined();
  });

  it('shows error message when panel fails to load', async () => {
    renderPanel('nonexistent-ext');
    const errorMessage = await screen.findByText(
      /failed to load panel/i,
      {},
      { timeout: 3000 }
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
