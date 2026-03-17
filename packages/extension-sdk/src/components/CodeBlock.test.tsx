import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock code="console.log('hello')" />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('renders code in a pre/code block', () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    const pre = container.querySelector('pre');
    const code = container.querySelector('code');
    expect(pre).toBeInTheDocument();
    expect(code).toBeInTheDocument();
  });

  it('applies monospace styling', () => {
    const { container } = render(<CodeBlock code="test" />);
    const code = container.querySelector('code');
    expect(code).toHaveClass('font-mono');
  });

  it('sets data-language attribute when language is provided', () => {
    const { container } = render(
      <CodeBlock code="const x = 1;" language="typescript" />
    );
    const code = container.querySelector('code');
    expect(code).toHaveAttribute('data-language', 'typescript');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CodeBlock code="test" className="custom-code" />
    );
    expect(container.firstChild).toHaveClass('custom-code');
  });
});
