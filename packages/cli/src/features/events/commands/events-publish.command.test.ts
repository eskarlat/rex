import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn(), success: vi.fn(), warn: vi.fn() },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import * as clack from '@clack/prompts';
import { handleEventsPublish } from './events-publish.command.js';

describe('events:publish command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes an event to the server', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    await handleEventsPublish({
      type: 'ext:test:done',
      data: '{"id":1}',
      source: 'ext:test',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4200/api/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'ext:test:done',
          source: 'ext:test',
          data: { id: 1 },
        }),
      }),
    );
    expect(clack.log.success).toHaveBeenCalledWith(
      expect.stringContaining('ext:test:done'),
    );
  });

  it('rejects invalid JSON data', async () => {
    await handleEventsPublish({
      type: 'ext:test:done',
      data: 'not-json',
      source: 'system',
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON'));
  });

  it('warns when server is not reachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await handleEventsPublish({
      type: 'ext:test:done',
      data: '{}',
      source: 'system',
    });

    expect(clack.log.warn).toHaveBeenCalledWith(
      expect.stringContaining('Could not reach dashboard server'),
    );
  });

  it('handles server error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await handleEventsPublish({
      type: 'ext:test:done',
      data: '{}',
      source: 'system',
    });

    expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('500'));
  });
});
