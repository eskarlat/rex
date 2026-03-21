import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { NotificationCenter } from './NotificationCenter';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockNotifications = vi.fn();
const mockUnreadCount = vi.fn();
const mockMarkRead = { mutate: vi.fn() };
const mockMarkAllRead = { mutate: vi.fn() };
const mockDeleteNotification = { mutate: vi.fn() };

vi.mock('./use-browser-notifications', () => ({
  useBrowserNotifications: vi.fn(),
}));

vi.mock('./use-notification-socket', () => ({
  useNotificationSocket: vi.fn(),
}));

vi.mock('@/core/hooks/use-notifications', () => ({
  useNotifications: () => mockNotifications(),
  useUnreadCount: () => mockUnreadCount(),
  useMarkRead: () => mockMarkRead,
  useMarkAllRead: () => mockMarkAllRead,
  useDeleteNotification: () => mockDeleteNotification,
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationCenter />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotifications.mockReturnValue({ data: [] });
    mockUnreadCount.mockReturnValue({ data: { unread: 0 } });
  });

  it('renders bell icon button', () => {
    renderComponent();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('shows unread count badge when unread > 0', () => {
    mockUnreadCount.mockReturnValue({ data: { unread: 3 } });
    renderComponent();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show badge when unread is 0', () => {
    renderComponent();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notification items when data exists', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          extension_name: 'ext:test',
          title: 'Build done',
          message: 'All tests pass',
          variant: 'success',
          action_url: null,
          read: 0,
          created_at: new Date().toISOString(),
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 1 } });

    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Build done')).toBeInTheDocument();
    expect(screen.getByText('All tests pass')).toBeInTheDocument();
  });

  it('shows mark all read button when there are unread notifications', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockUnreadCount.mockReturnValue({ data: { unread: 2 } });
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          title: 'Test',
          message: '',
          variant: 'info',
          read: 0,
          created_at: new Date().toISOString(),
          extension_name: 'ext:test',
          action_url: null,
        },
      ],
    });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('shows 99+ when unread count exceeds 99', () => {
    mockUnreadCount.mockReturnValue({ data: { unread: 150 } });
    renderComponent();
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('calls markRead when notification is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 7,
          title: 'Click me',
          message: 'Some msg',
          variant: 'warning',
          read: 0,
          created_at: new Date().toISOString(),
          extension_name: 'ext:test',
          action_url: null,
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 1 } });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    await userEvent.click(screen.getByText('Click me'));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith(7);
  });

  it('calls deleteNotification when delete button is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 5,
          title: 'Delete me',
          message: '',
          variant: 'error',
          read: 1,
          created_at: new Date().toISOString(),
          extension_name: 'ext:test',
          action_url: null,
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 0 } });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    await userEvent.click(screen.getByLabelText('Delete notification'));
    expect(mockDeleteNotification.mutate).toHaveBeenCalledWith(5);
  });

  it('shows relative time for older notifications', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 1, title: 'Recent', message: '', variant: 'info',
          read: 0, created_at: fiveMinutesAgo, extension_name: 'ext:test', action_url: null,
        },
        {
          id: 2, title: 'Hours', message: '', variant: 'info',
          read: 0, created_at: twoHoursAgo, extension_name: 'ext:test', action_url: null,
        },
        {
          id: 3, title: 'Days', message: '', variant: 'info',
          read: 0, created_at: threeDaysAgo, extension_name: 'ext:test', action_url: null,
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 3 } });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('3d ago')).toBeInTheDocument();
  });

  it('handles undefined count data gracefully', () => {
    mockUnreadCount.mockReturnValue({ data: undefined });
    renderComponent();
    // Should not show a badge
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('marks read on Enter keydown', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 9, title: 'Key test', message: '', variant: 'info',
          read: 0, created_at: new Date().toISOString(), extension_name: 'ext:test', action_url: null,
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 1 } });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    const item = screen.getByRole('button', { name: /Delete notification/i }).closest('[role="button"]')!;
    item.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockMarkRead.mutate).toHaveBeenCalledWith(9);
  });

  it('navigates when clicking a notification with action_url', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockUnreadCount.mockReturnValue({ data: { unread: 1 } });
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          title: 'Navigable',
          message: 'Click me',
          variant: 'info',
          read: 0,
          created_at: new Date().toISOString(),
          extension_name: 'ext:test',
          action_url: '/settings',
        },
      ],
    });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    await userEvent.click(screen.getByText('Navigable'));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('calls markAllRead when mark all read is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockUnreadCount.mockReturnValue({ data: { unread: 3 } });
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 1,
          title: 'N1',
          message: '',
          variant: 'info',
          read: 0,
          created_at: new Date().toISOString(),
          extension_name: 'ext:test',
          action_url: null,
        },
      ],
    });
    renderComponent();
    await userEvent.click(screen.getByLabelText('Notifications'));
    await userEvent.click(screen.getByText('Mark all read'));
    expect(mockMarkAllRead.mutate).toHaveBeenCalled();
  });
});
