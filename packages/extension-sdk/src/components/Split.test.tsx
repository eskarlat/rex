import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Split } from './Split';

describe('Split', () => {
  it('renders left and right panes', () => {
    render(
      <Split left={<span>Left pane</span>} right={<span>Right pane</span>} />
    );
    expect(screen.getByText('Left pane')).toBeInTheDocument();
    expect(screen.getByText('Right pane')).toBeInTheDocument();
  });

  it('uses default ratio of 1fr 1fr', () => {
    const { container } = render(
      <Split left={<span>L</span>} right={<span>R</span>} />
    );
    expect(container.firstChild).toHaveStyle({
      gridTemplateColumns: '1fr 1fr',
    });
  });

  it('applies custom ratio', () => {
    const { container } = render(
      <Split left={<span>L</span>} right={<span>R</span>} ratio="2fr 1fr" />
    );
    expect(container.firstChild).toHaveStyle({
      gridTemplateColumns: '2fr 1fr',
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <Split
        left={<span>L</span>}
        right={<span>R</span>}
        className="custom-split"
      />
    );
    expect(container.firstChild).toHaveClass('custom-split');
  });
});
