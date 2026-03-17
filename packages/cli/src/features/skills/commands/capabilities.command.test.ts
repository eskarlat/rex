import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

vi.mock('../capabilities-aggregator.js', () => ({
  aggregateSkills: vi.fn(),
}));

import * as clack from '@clack/prompts';
import { handleCapabilities } from './capabilities.command.js';
import * as aggregator from '../capabilities-aggregator.js';

describe('capabilities command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('outputs aggregated skills', () => {
    vi.mocked(aggregator.aggregateSkills).mockReturnValue('## ext-a\n\nSkill content');

    handleCapabilities({ projectPath: '/tmp/project' });

    expect(aggregator.aggregateSkills).toHaveBeenCalledWith('/tmp/project');
    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('ext-a'));
  });

  it('outputs no-skills message', () => {
    vi.mocked(aggregator.aggregateSkills).mockReturnValue('No skills found.');

    handleCapabilities({ projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith('No skills found.');
  });
});
