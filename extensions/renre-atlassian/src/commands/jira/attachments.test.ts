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
import downloadAttachment from './download-attachment.js';
import getIssueImages from './get-issue-images.js';

const mockJira = {
  downloadAttachment: vi.fn(),
  getIssueForAttachments: vi.fn(),
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

describe('download-attachment', () => {
  it('calls jira.downloadAttachment and returns content', async () => {
    mockJira.downloadAttachment.mockResolvedValue({
      text: () => Promise.resolve('file content'),
    });
    const ctx = makeContext({ attachmentId: '99' });
    await downloadAttachment.handler(ctx);
    expect(mockJira.downloadAttachment).toHaveBeenCalledWith('99');
    expect(toOutput).toHaveBeenCalledWith({ attachmentId: '99', content: 'file content' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.downloadAttachment.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ attachmentId: '99' });
    const result = await downloadAttachment.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-issue-images', () => {
  it('calls jira.getIssueForAttachments and filters image attachments', async () => {
    mockJira.getIssueForAttachments.mockResolvedValue({
      attachments: [
        { id: '1', mimeType: 'image/png', filename: 'screenshot.png' },
        { id: '2', mimeType: 'application/pdf', filename: 'doc.pdf' },
        { id: '3', mimeType: 'image/jpeg', filename: 'photo.jpg' },
      ],
    });
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueImages.handler(ctx);
    expect(mockJira.getIssueForAttachments).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith([
      { id: '1', mimeType: 'image/png', filename: 'screenshot.png' },
      { id: '3', mimeType: 'image/jpeg', filename: 'photo.jpg' },
    ]);
  });

  it('returns empty array when no attachments', async () => {
    mockJira.getIssueForAttachments.mockResolvedValue({});
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueImages.handler(ctx);
    expect(toOutput).toHaveBeenCalledWith([]);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getIssueForAttachments.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssueImages.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
