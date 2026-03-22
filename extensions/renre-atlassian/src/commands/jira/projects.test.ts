vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { CommandContext } from '../../shared/types.js';
import getAllProjects from './get-all-projects.js';
import getProjectVersions from './get-project-versions.js';
import getProjectComponents from './get-project-components.js';
import createVersion from './create-version.js';
import batchCreateVersions from './batch-create-versions.js';

const mockJira = {
  getAllProjects: vi.fn(),
  getProjectVersions: vi.fn(),
  getProjectComponents: vi.fn(),
  createVersion: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClients).mockReturnValue({ jira: mockJira as never, confluence: {} as never });
});

describe('get-all-projects', () => {
  it('calls jira.getAllProjects', async () => {
    const projects = [{ key: 'PROJ' }];
    mockJira.getAllProjects.mockResolvedValue(projects);
    const ctx = makeContext();
    await getAllProjects.handler(ctx);
    expect(mockJira.getAllProjects).toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(projects);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getAllProjects.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await getAllProjects.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-project-versions', () => {
  it('calls jira.getProjectVersions with projectKey', async () => {
    const versions = [{ id: '1', name: 'v1.0' }];
    mockJira.getProjectVersions.mockResolvedValue(versions);
    const ctx = makeContext({ projectKey: 'PROJ' });
    await getProjectVersions.handler(ctx);
    expect(mockJira.getProjectVersions).toHaveBeenCalledWith('PROJ');
    expect(toOutput).toHaveBeenCalledWith(versions);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getProjectVersions.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ projectKey: 'PROJ' });
    const result = await getProjectVersions.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-project-components', () => {
  it('calls jira.getProjectComponents with projectKey', async () => {
    const components = [{ id: '1', name: 'Backend' }];
    mockJira.getProjectComponents.mockResolvedValue(components);
    const ctx = makeContext({ projectKey: 'PROJ' });
    await getProjectComponents.handler(ctx);
    expect(mockJira.getProjectComponents).toHaveBeenCalledWith('PROJ');
    expect(toOutput).toHaveBeenCalledWith(components);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getProjectComponents.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ projectKey: 'PROJ' });
    const result = await getProjectComponents.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('create-version', () => {
  it('calls jira.createVersion with project, name, description, releaseDate', async () => {
    mockJira.createVersion.mockResolvedValue({ id: '10' });
    const ctx = makeContext({
      projectKey: 'PROJ',
      name: 'v1.0',
      description: 'First release',
      releaseDate: '2026-01-01',
    });
    await createVersion.handler(ctx);
    expect(mockJira.createVersion).toHaveBeenCalledWith({
      project: 'PROJ',
      name: 'v1.0',
      description: 'First release',
      releaseDate: '2026-01-01',
    });
    expect(toOutput).toHaveBeenCalledWith({ id: '10' });
  });

  it('creates version without optional fields', async () => {
    mockJira.createVersion.mockResolvedValue({ id: '11' });
    const ctx = makeContext({ projectKey: 'PROJ', name: 'v2.0' });
    await createVersion.handler(ctx);
    expect(mockJira.createVersion).toHaveBeenCalledWith({
      project: 'PROJ',
      name: 'v2.0',
    });
  });

  it('returns errorOutput on error', async () => {
    mockJira.createVersion.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ projectKey: 'PROJ', name: 'v1.0' });
    const result = await createVersion.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('batch-create-versions', () => {
  it('calls jira.createVersion for each version with project key', async () => {
    mockJira.createVersion
      .mockResolvedValueOnce({ id: '1' })
      .mockResolvedValueOnce({ id: '2' });
    const versions = [{ name: 'v1.0' }, { name: 'v2.0' }];
    const ctx = makeContext({ projectKey: 'PROJ', versions });
    await batchCreateVersions.handler(ctx);
    expect(mockJira.createVersion).toHaveBeenCalledTimes(2);
    expect(mockJira.createVersion).toHaveBeenCalledWith({ project: 'PROJ', name: 'v1.0' });
    expect(mockJira.createVersion).toHaveBeenCalledWith({ project: 'PROJ', name: 'v2.0' });
    expect(toOutput).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }]);
  });

  it('returns errorOutput on error', async () => {
    mockJira.createVersion.mockRejectedValue(new Error('fail'));
    const versions = [{ name: 'v1.0' }];
    const ctx = makeContext({ projectKey: 'PROJ', versions });
    const result = await batchCreateVersions.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
