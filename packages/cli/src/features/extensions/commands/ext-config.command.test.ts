import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

import * as clack from '@clack/prompts';
import { handleExtConfig } from './ext-config.command.js';

describe('ext-config command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prints Phase 2 stub message', () => {
    handleExtConfig();
    expect(clack.log.info).toHaveBeenCalledWith('Config management available in Phase 2');
  });
});
