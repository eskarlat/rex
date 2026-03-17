import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), error: vi.fn() },
  spinner: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn() }),
}));

import * as clack from '@clack/prompts';
import { handleExtRestart } from './ext-restart.command.js';

describe('ext-restart command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls restart and reports success', async () => {
    const restartFn = vi.fn().mockResolvedValue({ extensionName: 'my-ext', transport: 'stdio', state: 'running', retryCount: 0 });

    await handleExtRestart({ name: 'my-ext', restartFn });

    expect(restartFn).toHaveBeenCalledWith('my-ext');
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('handles restart failure', async () => {
    const restartFn = vi.fn().mockRejectedValue(new Error('Process crashed'));

    await handleExtRestart({ name: 'my-ext', restartFn });

    expect(clack.log.error).toHaveBeenCalled();
  });
});
