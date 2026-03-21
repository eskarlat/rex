import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';

function QueryClientInspector() {
  const client = useQueryClient();
  const staleTime = client.getDefaultOptions().queries?.staleTime;
  return <span data-testid="stale-time">{String(staleTime)}</span>;
}

describe('QueryProvider', () => {
  it('renders children', () => {
    render(
      <QueryProvider>
        <span>child content</span>
      </QueryProvider>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('accepts custom QueryClient', () => {
    const customClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 99_999 } },
    });
    render(
      <QueryProvider client={customClient}>
        <QueryClientInspector />
      </QueryProvider>,
    );
    expect(screen.getByTestId('stale-time').textContent).toBe('99999');
  });

  it('works with default client', () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    expect(screen.getByTestId('stale-time').textContent).toBe('30000');
  });
});
