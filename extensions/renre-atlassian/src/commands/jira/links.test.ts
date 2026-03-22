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
import createIssueLink from './create-issue-link.js';
import getLinkTypes from './get-link-types.js';
import linkToEpic from './link-to-epic.js';
import createRemoteIssueLink from './create-remote-issue-link.js';
import removeIssueLink from './remove-issue-link.js';

const mockJira = {
  createIssueLink: vi.fn(),
  getLinkTypes: vi.fn(),
  linkToEpic: vi.fn(),
  createRemoteIssueLink: vi.fn(),
  removeIssueLink: vi.fn(),
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

describe('create-issue-link', () => {
  it('calls jira.createIssueLink with type, inward and outward issue', async () => {
    mockJira.createIssueLink.mockResolvedValue(undefined);
    const ctx = makeContext({
      typeName: 'Blocks',
      inwardIssueKey: 'TEST-1',
      outwardIssueKey: 'TEST-2',
    });
    await createIssueLink.handler(ctx);
    expect(mockJira.createIssueLink).toHaveBeenCalledWith({
      type: { name: 'Blocks' },
      inwardIssue: { key: 'TEST-1' },
      outwardIssue: { key: 'TEST-2' },
    });
    expect(toOutput).toHaveBeenCalledWith({ success: true });
  });

  it('returns errorOutput on error', async () => {
    mockJira.createIssueLink.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({
      typeName: 'Blocks',
      inwardIssueKey: 'TEST-1',
      outwardIssueKey: 'TEST-2',
    });
    const result = await createIssueLink.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-link-types', () => {
  it('calls jira.getLinkTypes and returns result', async () => {
    const types = { issueLinkTypes: [{ name: 'Blocks' }] };
    mockJira.getLinkTypes.mockResolvedValue(types);
    const ctx = makeContext();
    await getLinkTypes.handler(ctx);
    expect(mockJira.getLinkTypes).toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(types);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getLinkTypes.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await getLinkTypes.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('link-to-epic', () => {
  it('calls jira.linkToEpic with epicKey and issueKeys', async () => {
    mockJira.linkToEpic.mockResolvedValue(undefined);
    const ctx = makeContext({ epicKey: 'EPIC-1', issueKeys: ['TEST-1', 'TEST-2'] });
    await linkToEpic.handler(ctx);
    expect(mockJira.linkToEpic).toHaveBeenCalledWith('EPIC-1', ['TEST-1', 'TEST-2']);
    expect(toOutput).toHaveBeenCalledWith({ success: true });
  });

  it('returns errorOutput on error', async () => {
    mockJira.linkToEpic.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ epicKey: 'EPIC-1', issueKeys: ['TEST-1'] });
    const result = await linkToEpic.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('create-remote-issue-link', () => {
  it('calls jira.createRemoteIssueLink with issueKey and link object', async () => {
    mockJira.createRemoteIssueLink.mockResolvedValue({ id: 10 });
    const ctx = makeContext({
      issueKey: 'TEST-1',
      url: 'https://example.com',
      title: 'Example Link',
    });
    await createRemoteIssueLink.handler(ctx);
    expect(mockJira.createRemoteIssueLink).toHaveBeenCalledWith('TEST-1', {
      object: { url: 'https://example.com', title: 'Example Link' },
    });
    expect(toOutput).toHaveBeenCalledWith({ id: 10 });
  });

  it('returns errorOutput on error', async () => {
    mockJira.createRemoteIssueLink.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', url: 'https://example.com', title: 'Link' });
    const result = await createRemoteIssueLink.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('remove-issue-link', () => {
  it('calls jira.removeIssueLink with linkId and returns success', async () => {
    mockJira.removeIssueLink.mockResolvedValue(undefined);
    const ctx = makeContext({ linkId: '12345' });
    await removeIssueLink.handler(ctx);
    expect(mockJira.removeIssueLink).toHaveBeenCalledWith('12345');
    expect(toOutput).toHaveBeenCalledWith({ success: true, linkId: '12345' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.removeIssueLink.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ linkId: '12345' });
    const result = await removeIssueLink.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
