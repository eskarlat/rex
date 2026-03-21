import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  log: {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../checks/index.js', () => ({
  getAllChecks: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleDoctor } from './doctor.command.js';
import { getAllChecks } from '../checks/index.js';

describe('doctor command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;
  });

  it('should display results for all checks', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'Test check 1',
        run: () => ({ name: 'Test check 1', status: 'pass', message: 'all good' }),
      },
      {
        name: 'Test check 2',
        run: () => ({
          name: 'Test check 2',
          status: 'warn',
          message: 'minor issue',
          detail: 'fix it',
        }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(clack.intro).toHaveBeenCalledWith('renre-kit doctor');
    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('Test check 1'));
    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('Test check 2'));
    expect(clack.outro).toHaveBeenCalledWith('1 passed, 1 warning(s), 0 failure(s)');
    expect(process.exitCode).toBeUndefined();
  });

  it('should set exitCode 1 when any check fails', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'Failing check',
        run: () => ({ name: 'Failing check', status: 'fail', message: 'broken', detail: 'fix it' }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(clack.log.error).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('should not set exitCode when all pass', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'OK check',
        run: () => ({ name: 'OK check', status: 'pass', message: 'fine' }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(process.exitCode).toBeUndefined();
  });

  it('should handle async checks', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'Async check',
        run: async () => ({ name: 'Async check', status: 'pass', message: 'async ok' }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('Async check'));
  });

  it('should handle warn without detail', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'Warn no detail',
        run: () => ({ name: 'Warn no detail', status: 'warn', message: 'minor' }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(clack.log.warn).toHaveBeenCalled();
    // info should not be called for detail since there is none
    expect(clack.log.info).not.toHaveBeenCalled();
  });

  it('should handle fail without detail', async () => {
    vi.mocked(getAllChecks).mockReturnValue([
      {
        name: 'Fail no detail',
        run: () => ({ name: 'Fail no detail', status: 'fail', message: 'broken' }),
      },
    ]);

    await handleDoctor(null, () => ({}));

    expect(clack.log.error).toHaveBeenCalled();
    expect(clack.log.info).not.toHaveBeenCalled();
  });
});
