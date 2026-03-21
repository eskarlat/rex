import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders title and children', () => {
    render(<Panel title="Test Panel">Panel content</Panel>);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders optional description', () => {
    render(
      <Panel title="Title" description="A description">
        Content
      </Panel>,
    );
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<Panel title="Title">Content</Panel>);
    expect(screen.queryByText('A description')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Panel title="Title" className="custom-class">
        Content
      </Panel>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
