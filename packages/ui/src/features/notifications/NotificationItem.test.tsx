import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem, formatRelativeTime } from './NotificationItem';

const baseNotification = {
  id: 1,
  extension_name: 'ext:test',
  title: 'Test notification',
  message: 'Some message',
  variant: 'info' as const,
  action_url: null,
  read: 0,
  created_at: new Date().toISOString(),
};

describe('NotificationItem', () => {
  it('renders title and message', () => {
    render(
      <NotificationItem notification={baseNotification} onRead={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    expect(screen.getByText('Some message')).toBeInTheDocument();
  });

  it('calls onRead when clicked', async () => {
    const onRead = vi.fn();
    render(
      <NotificationItem notification={baseNotification} onRead={onRead} onDelete={vi.fn()} />,
    );
    await userEvent.click(screen.getByText('Test notification'));
    expect(onRead).toHaveBeenCalledWith(1, null);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <NotificationItem notification={baseNotification} onRead={vi.fn()} onDelete={onDelete} />,
    );
    await userEvent.click(screen.getByLabelText('Delete notification'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('applies unread background when read is 0', () => {
    const { container } = render(
      <NotificationItem notification={baseNotification} onRead={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.firstChild).toHaveClass('bg-muted/30');
  });

  it('does not apply unread background when read is 1', () => {
    const { container } = render(
      <NotificationItem
        notification={{ ...baseNotification, read: 1 }}
        onRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(container.firstChild).not.toHaveClass('bg-muted/30');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent timestamps', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
});
