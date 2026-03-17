import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinPrompt } from './PinPrompt';

const mockFetchApi = vi.fn();

vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
  ApiError: class ApiError extends Error {
    status: number;
    statusText: string;
    body: unknown;
    constructor(status: number, statusText: string, body: unknown) {
      super(`API Error ${status}: ${statusText}`);
      this.status = status;
      this.statusText = statusText;
      this.body = body;
    }
  },
}));

beforeEach(() => {
  mockFetchApi.mockReset();
});

describe('PinPrompt', () => {
  it('renders PIN input', () => {
    render(<PinPrompt onSuccess={vi.fn()} />);
    expect(screen.getByLabelText('PIN')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<PinPrompt onSuccess={vi.fn()} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('disables submit when PIN is less than 4 digits', () => {
    render(<PinPrompt onSuccess={vi.fn()} />);
    const button = screen.getByText('Submit');
    expect(button).toBeDisabled();
  });

  it('enables submit when PIN is 4 digits', async () => {
    render(<PinPrompt onSuccess={vi.fn()} />);
    const input = screen.getByLabelText('PIN');
    await userEvent.type(input, '1234');
    const button = screen.getByText('Submit');
    expect(button).toBeEnabled();
  });

  it('calls onSuccess when PIN is valid', async () => {
    const onSuccess = vi.fn();
    mockFetchApi.mockResolvedValueOnce(undefined);
    render(<PinPrompt onSuccess={onSuccess} />);
    const input = screen.getByLabelText('PIN');
    await userEvent.type(input, '1234');
    await userEvent.click(screen.getByText('Submit'));
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error for invalid PIN from server', async () => {
    const { ApiError } = await import('@/core/api/client');
    mockFetchApi.mockRejectedValueOnce(
      new ApiError(401, 'Unauthorized', null)
    );
    render(<PinPrompt onSuccess={vi.fn()} />);
    const input = screen.getByLabelText('PIN');
    await userEvent.type(input, '0000');
    await userEvent.click(screen.getByText('Submit'));
    expect(
      await screen.findByText('Invalid PIN. Please try again.')
    ).toBeInTheDocument();
  });

  it('only allows numeric input', async () => {
    render(<PinPrompt onSuccess={vi.fn()} />);
    const input = screen.getByLabelText('PIN');
    await userEvent.type(input, 'abcd1234extra');
    expect(input).toHaveValue('1234');
  });
});
