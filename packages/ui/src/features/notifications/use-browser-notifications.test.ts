import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NotificationRecord } from '@/core/hooks/use-notifications';

// Mock useNotifications — returns a mutable ref so we can swap data between renders
const mockData = { current: undefined as NotificationRecord[] | undefined };

vi.mock('@/core/hooks/use-notifications', () => ({
  useNotifications: () => ({ data: mockData.current }) as UseQueryResult<NotificationRecord[]>,
}));

import { useBrowserNotifications } from './use-browser-notifications';

function makeNotification(overrides: Partial<NotificationRecord> = {}): NotificationRecord {
  return {
    id: 1,
    extension_name: 'ext:test',
    title: 'Test',
    message: 'Hello',
    variant: 'info',
    action_url: null,
    read: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('useBrowserNotifications', () => {
  let mockRequestPermission: ReturnType<typeof vi.fn>;
  let MockNotification: ReturnType<typeof vi.fn>;
  let originalNotification: typeof globalThis.Notification;

  beforeEach(() => {
    mockData.current = undefined;
    mockRequestPermission = vi.fn().mockResolvedValue('granted');
    MockNotification = vi.fn();
    MockNotification.permission = 'default';
    MockNotification.requestPermission = mockRequestPermission;
    originalNotification = globalThis.Notification;
    Object.defineProperty(globalThis, 'Notification', {
      value: MockNotification,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Notification', {
      value: originalNotification,
      writable: true,
      configurable: true,
    });
  });

  it('requests notification permission on mount', () => {
    renderHook(() => useBrowserNotifications());
    expect(mockRequestPermission).toHaveBeenCalledOnce();
  });

  it('does not request permission if already granted', () => {
    MockNotification.permission = 'granted';
    renderHook(() => useBrowserNotifications());
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  it('does not request permission if already denied', () => {
    MockNotification.permission = 'denied';
    renderHook(() => useBrowserNotifications());
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  it('seeds lastSeenId on first data load without firing', () => {
    MockNotification.permission = 'granted';
    mockData.current = [makeNotification({ id: 5 })];

    renderHook(() => useBrowserNotifications());

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it('fires browser notification for new unread items after seed', () => {
    MockNotification.permission = 'granted';

    // First load — seeds
    mockData.current = [makeNotification({ id: 5, title: 'Old' })];
    const { rerender } = renderHook(() => useBrowserNotifications());
    expect(MockNotification).not.toHaveBeenCalled();

    // Second poll — new item with id=7
    mockData.current = [
      makeNotification({ id: 7, title: 'New alert', message: 'Details here' }),
      makeNotification({ id: 5, title: 'Old' }),
    ];
    rerender();

    expect(MockNotification).toHaveBeenCalledOnce();
    expect(MockNotification).toHaveBeenCalledWith('New alert', {
      body: 'Details here',
      tag: 'renre-kit-notification-7',
    });
  });

  it('fires for multiple new items', () => {
    MockNotification.permission = 'granted';

    mockData.current = [makeNotification({ id: 3 })];
    const { rerender } = renderHook(() => useBrowserNotifications());

    mockData.current = [
      makeNotification({ id: 6, title: 'Third' }),
      makeNotification({ id: 5, title: 'Second' }),
      makeNotification({ id: 4, title: 'First' }),
      makeNotification({ id: 3 }),
    ];
    rerender();

    expect(MockNotification).toHaveBeenCalledTimes(3);
  });

  it('does not fire for already-seen ids on rerender', () => {
    MockNotification.permission = 'granted';

    mockData.current = [makeNotification({ id: 5 })];
    const { rerender } = renderHook(() => useBrowserNotifications());

    // Same data
    rerender();

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it('skips read notifications', () => {
    MockNotification.permission = 'granted';

    mockData.current = [makeNotification({ id: 3 })];
    const { rerender } = renderHook(() => useBrowserNotifications());

    mockData.current = [
      makeNotification({ id: 5, read: 1, title: 'Read' }),
      makeNotification({ id: 4, title: 'Unread' }),
      makeNotification({ id: 3 }),
    ];
    rerender();

    expect(MockNotification).toHaveBeenCalledOnce();
    expect(MockNotification).toHaveBeenCalledWith('Unread', expect.any(Object));
  });

  it('does not fire when permission is denied', () => {
    MockNotification.permission = 'denied';

    mockData.current = [makeNotification({ id: 3 })];
    const { rerender } = renderHook(() => useBrowserNotifications());

    mockData.current = [
      makeNotification({ id: 5, title: 'Denied' }),
      makeNotification({ id: 3 }),
    ];
    rerender();

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it('handles missing Notification API gracefully', () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    mockData.current = [makeNotification({ id: 1 })];

    expect(() => {
      renderHook(() => useBrowserNotifications());
    }).not.toThrow();
  });

  it('omits body when message is empty', () => {
    MockNotification.permission = 'granted';

    mockData.current = [makeNotification({ id: 1 })];
    const { rerender } = renderHook(() => useBrowserNotifications());

    mockData.current = [
      makeNotification({ id: 2, title: 'No body', message: '' }),
      makeNotification({ id: 1 }),
    ];
    rerender();

    expect(MockNotification).toHaveBeenCalledWith('No body', {
      body: undefined,
      tag: 'renre-kit-notification-2',
    });
  });

  it('does not fire when data is undefined', () => {
    MockNotification.permission = 'granted';
    mockData.current = undefined;

    renderHook(() => useBrowserNotifications());

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it('does not fire when data is empty array', () => {
    MockNotification.permission = 'granted';
    mockData.current = [];

    renderHook(() => useBrowserNotifications());

    expect(MockNotification).not.toHaveBeenCalled();
  });
});
