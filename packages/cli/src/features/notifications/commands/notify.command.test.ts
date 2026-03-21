import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const mockCreateNotification = vi.fn();
vi.mock('../notification-manager.js', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

const mockGetDb = vi.fn().mockReturnValue({});
vi.mock('../../../core/database/database.js', () => ({
  getDb: () => mockGetDb(),
}));

import * as clack from '@clack/prompts';
import { handleNotify } from './notify.command.js';

describe('notify command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateNotification.mockReturnValue({ id: 1 });
  });

  it('creates a notification with valid options', () => {
    handleNotify({
      title: 'Build done',
      message: 'All tests pass',
      variant: 'success',
      source: 'system',
    });

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        extension_name: 'system',
        title: 'Build done',
        message: 'All tests pass',
        variant: 'success',
      }),
    );
    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('id: 1'));
  });

  it('rejects invalid variant', () => {
    handleNotify({
      title: 'Test',
      message: 'msg',
      variant: 'invalid',
      source: 'system',
    });

    expect(mockCreateNotification).not.toHaveBeenCalled();
    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('Invalid variant'));
  });

  it('passes action_url when provided', () => {
    handleNotify({
      title: 'Click me',
      message: 'msg',
      variant: 'info',
      source: 'ext:test',
      actionUrl: '/extensions/test',
    });

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action_url: '/extensions/test' }),
    );
  });
});
