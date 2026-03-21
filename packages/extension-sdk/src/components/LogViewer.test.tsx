import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogViewer } from './LogViewer';

describe('LogViewer', () => {
  const lines = ['Line 1', 'Line 2', 'Line 3'];

  it('renders all log lines', () => {
    render(<LogViewer lines={lines} />);
    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('uses default maxHeight of 400px', () => {
    const { container } = render(<LogViewer lines={lines} />);
    expect(container.firstChild).toHaveStyle({ maxHeight: '400px' });
  });

  it('applies custom maxHeight', () => {
    const { container } = render(<LogViewer lines={lines} maxHeight="200px" />);
    expect(container.firstChild).toHaveStyle({ maxHeight: '200px' });
  });

  it('applies custom className', () => {
    const { container } = render(<LogViewer lines={lines} className="custom-log" />);
    expect(container.firstChild).toHaveClass('custom-log');
  });

  it('renders empty when no lines provided', () => {
    const { container } = render(<LogViewer lines={[]} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children).toHaveLength(0);
  });
});
