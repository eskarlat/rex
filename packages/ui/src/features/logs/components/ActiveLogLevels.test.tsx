import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUseSettings = vi.fn();

vi.mock('@/core/hooks/use-settings', () => ({
  useSettings: () => mockUseSettings(),
}));

import { ActiveLogLevels } from './ActiveLogLevels';

describe('ActiveLogLevels', () => {
  it('renders nothing when config is not loaded', () => {
    mockUseSettings.mockReturnValue({ data: undefined });
    const { container } = render(<ActiveLogLevels />);
    expect(container.innerHTML).toBe('');
  });

  it('renders exactly the configured logLevels as badges', () => {
    mockUseSettings.mockReturnValue({
      data: { settings: { logLevels: ['warn', 'error'] } },
    });
    render(<ActiveLogLevels />);
    expect(screen.getByText('Active levels:')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    // Verify other levels are NOT rendered
    expect(screen.queryByText('debug')).not.toBeInTheDocument();
    expect(screen.queryByText('info')).not.toBeInTheDocument();
  });

  it('uses single logLevel if logLevels is missing', () => {
    mockUseSettings.mockReturnValue({
      data: { settings: { logLevel: 'debug' } },
    });
    render(<ActiveLogLevels />);
    expect(screen.getByText('debug')).toBeInTheDocument();
    // Only the single level should be rendered
    expect(screen.queryByText('info')).not.toBeInTheDocument();
    expect(screen.queryByText('warn')).not.toBeInTheDocument();
    expect(screen.queryByText('error')).not.toBeInTheDocument();
  });

  it('falls back to default levels when neither logLevels nor logLevel is set', () => {
    mockUseSettings.mockReturnValue({
      data: { settings: {} },
    });
    render(<ActiveLogLevels />);
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    // debug should NOT be in the default set
    expect(screen.queryByText('debug')).not.toBeInTheDocument();
  });
});
