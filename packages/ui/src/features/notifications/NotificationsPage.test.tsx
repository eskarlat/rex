import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificationsPage } from './NotificationsPage';

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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotifications.mockReturnValue({ data: [] });
    mockUnreadCount.mockReturnValue({ data: { unread: 0 } });
  });

  it('renders page heading', () => {
    renderPage();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    renderPage();
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notification items', () => {
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
    renderPage();
    expect(screen.getByText('Build done')).toBeInTheDocument();
    expect(screen.getByText('All tests pass')).toBeInTheDocument();
  });

  it('shows mark all read button when there are unread notifications', () => {
    mockUnreadCount.mockReturnValue({ data: { unread: 2 } });
    renderPage();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('hides mark all read button when no unread', () => {
    renderPage();
    expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
  });

  it('calls markRead and navigates when notification with action_url is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    mockNotifications.mockReturnValue({
      data: [
        {
          id: 3,
          extension_name: 'ext:test',
          title: 'Navigable',
          message: '',
          variant: 'info',
          action_url: '/settings',
          read: 0,
          created_at: new Date().toISOString(),
        },
      ],
    });
    mockUnreadCount.mockReturnValue({ data: { unread: 1 } });
    renderPage();
    await userEvent.click(screen.getByText('Navigable'));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith(3);
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});
