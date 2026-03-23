import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockDynamicUiAsset = vi.fn(() => null);

vi.mock('@/core/components/UiAssetErrorBoundary', () => ({
  DynamicUiAsset: (props: Record<string, unknown>) => {
    mockDynamicUiAsset(props);
    return null;
  },
}));

import { DynamicPanel } from './DynamicPanel';

function renderPanel(name: string, panelId?: string) {
  return render(
    <MemoryRouter>
      <DynamicPanel extensionName={name} panelId={panelId} />
    </MemoryRouter>,
  );
}

describe('DynamicPanel', () => {
  it('uses panel-specific URL when panelId is provided', () => {
    renderPanel('test-ext', 'my-panel');
    expect(mockDynamicUiAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        extensionName: 'test-ext',
        url: '/api/extensions/test-ext/panels/my-panel.js',
        label: 'panel',
      }),
    );
  });

  it('uses default panel URL when panelId is omitted', () => {
    renderPanel('test-ext');
    expect(mockDynamicUiAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        extensionName: 'test-ext',
        url: '/api/extensions/test-ext/panel.js',
        label: 'panel',
      }),
    );
  });
});
