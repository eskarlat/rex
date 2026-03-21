import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './markdown-renderer';

describe('MarkdownRenderer', () => {
  it('renders headings as HTML heading elements', () => {
    render(<MarkdownRenderer>{'# Hello World'}</MarkdownRenderer>);
    expect(screen.getByRole('heading', { level: 1, name: 'Hello World' })).toBeInTheDocument();
  });

  it('renders paragraphs', () => {
    render(<MarkdownRenderer>{'A simple paragraph.'}</MarkdownRenderer>);
    expect(screen.getByText('A simple paragraph.')).toBeInTheDocument();
  });

  it('renders unordered lists', () => {
    render(<MarkdownRenderer>{'- Item one\n- Item two'}</MarkdownRenderer>);
    expect(screen.getByText('Item one')).toBeInTheDocument();
    expect(screen.getByText('Item two')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders external links with target _blank and rel attributes', () => {
    render(<MarkdownRenderer>{'[Example](https://example.com)'}</MarkdownRenderer>);
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
  });

  it('renders internal links without target _blank', () => {
    render(<MarkdownRenderer>{'[Docs](/docs/intro)'}</MarkdownRenderer>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs/intro');
    expect(link).not.toHaveAttribute('target');
  });

  it('strips javascript: hrefs', () => {
    render(<MarkdownRenderer>{'[Click](javascript:alert(1))'}</MarkdownRenderer>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('renders inline code', () => {
    render(<MarkdownRenderer>{'Use `npm install` to install.'}</MarkdownRenderer>);
    expect(screen.getByText('npm install')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    render(<MarkdownRenderer>{'```\nconsole.log("hi");\n```'}</MarkdownRenderer>);
    expect(screen.getByText('console.log("hi");')).toBeInTheDocument();
  });

  it('renders GFM tables', () => {
    const md = '| Name | Value |\n| --- | --- |\n| foo | bar |';
    render(<MarkdownRenderer>{md}</MarkdownRenderer>);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('renders GFM task lists', () => {
    render(<MarkdownRenderer>{'- [x] Done\n- [ ] Pending'}</MarkdownRenderer>);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });

  it('applies custom className', () => {
    render(<MarkdownRenderer className="custom-class">{'# Test'}</MarkdownRenderer>);
    const container = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('applies testId', () => {
    render(<MarkdownRenderer testId="my-md">{'Hello'}</MarkdownRenderer>);
    expect(screen.getByTestId('my-md')).toBeInTheDocument();
  });

  it('renders bold and italic text', () => {
    render(<MarkdownRenderer>{'**bold** and *italic*'}</MarkdownRenderer>);
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('blocks external images and shows alt text', () => {
    render(<MarkdownRenderer>{'![Tracking pixel](https://evil.com/pixel.png)'}</MarkdownRenderer>);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Tracking pixel')).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    render(<MarkdownRenderer>{'> A quote'}</MarkdownRenderer>);
    expect(screen.getByText('A quote')).toBeInTheDocument();
  });
});
