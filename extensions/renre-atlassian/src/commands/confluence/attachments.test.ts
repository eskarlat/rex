vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext } from '../../shared/types.js';
import uploadAttachment from './upload-attachment.js';
import uploadAttachments from './upload-attachments.js';
import getAttachments from './get-attachments.js';
import downloadAttachment from './download-attachment.js';
import downloadAllAttachments from './download-all-attachments.js';
import deleteAttachment from './delete-attachment.js';
import getPageImages from './get-page-images.js';

const mockConfluence = {
  uploadAttachment: vi.fn(),
  getAttachments: vi.fn(),
  downloadAttachment: vi.fn(),
  deleteAttachment: vi.fn(),
  getPageImages: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClients).mockReturnValue({
    jira: {} as never,
    confluence: mockConfluence as never,
  });
});

describe('upload-attachment', () => {
  it('should upload a single attachment', async () => {
    mockConfluence.uploadAttachment.mockResolvedValue({ id: 'att1' });
    const ctx = makeContext({ pageId: '123', filename: 'doc.pdf', content: 'base64data' });
    const result = await uploadAttachment(ctx);
    expect(mockConfluence.uploadAttachment).toHaveBeenCalledWith('123', 'doc.pdf', 'base64data');
    expect(toOutput).toHaveBeenCalledWith({ id: 'att1' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.uploadAttachment.mockRejectedValue(new Error('Too large'));
    const result = await uploadAttachment(
      makeContext({ pageId: '123', filename: 'big.zip', content: 'x' }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('upload-attachments', () => {
  it('should upload multiple attachments in a loop', async () => {
    mockConfluence.uploadAttachment
      .mockResolvedValueOnce({ id: 'att1' })
      .mockResolvedValueOnce({ id: 'att2' });
    const ctx = makeContext({
      pageId: '123',
      files: [
        { filename: 'a.txt', content: 'aaa' },
        { filename: 'b.txt', content: 'bbb' },
      ],
    });
    const result = await uploadAttachments(ctx);
    expect(mockConfluence.uploadAttachment).toHaveBeenCalledTimes(2);
    expect(mockConfluence.uploadAttachment).toHaveBeenCalledWith('123', 'a.txt', 'aaa');
    expect(mockConfluence.uploadAttachment).toHaveBeenCalledWith('123', 'b.txt', 'bbb');
    expect(toOutput).toHaveBeenCalledWith([{ id: 'att1' }, { id: 'att2' }]);
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.uploadAttachment.mockRejectedValue(new Error('fail'));
    const result = await uploadAttachments(
      makeContext({ pageId: '123', files: [{ filename: 'x.txt', content: 'x' }] }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-attachments', () => {
  it('should get attachments with defaults', async () => {
    mockConfluence.getAttachments.mockResolvedValue({ results: [{ id: 'att1' }] });
    const ctx = makeContext({ pageId: '123' });
    const result = await getAttachments(ctx);
    expect(mockConfluence.getAttachments).toHaveBeenCalledWith('123', 25, 0);
    expect(toOutput).toHaveBeenCalledWith({ results: [{ id: 'att1' }] });
    expect(result.exitCode).toBe(0);
  });

  it('should get attachments with custom limit and start', async () => {
    mockConfluence.getAttachments.mockResolvedValue({ results: [] });
    const ctx = makeContext({ pageId: '123', limit: 10, start: 5 });
    await getAttachments(ctx);
    expect(mockConfluence.getAttachments).toHaveBeenCalledWith('123', 10, 5);
  });

  it('should handle errors', async () => {
    mockConfluence.getAttachments.mockRejectedValue(new Error('fail'));
    const result = await getAttachments(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('download-attachment', () => {
  it('should download an attachment and return its text content', async () => {
    mockConfluence.downloadAttachment.mockResolvedValue({
      text: () => Promise.resolve('file content here'),
    });
    const ctx = makeContext({ pageId: '123', filename: 'readme.md' });
    const result = await downloadAttachment(ctx);
    expect(mockConfluence.downloadAttachment).toHaveBeenCalledWith('123', 'readme.md');
    expect(toOutput).toHaveBeenCalledWith({
      pageId: '123',
      filename: 'readme.md',
      content: 'file content here',
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.downloadAttachment.mockRejectedValue(new Error('Not found'));
    const result = await downloadAttachment(
      makeContext({ pageId: '123', filename: 'missing.txt' }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('download-all-attachments', () => {
  it('should list all attachments for a page', async () => {
    mockConfluence.getAttachments.mockResolvedValue({
      results: [{ id: 'att1' }, { id: 'att2' }],
    });
    const ctx = makeContext({ pageId: '123' });
    const result = await downloadAllAttachments(ctx);
    expect(mockConfluence.getAttachments).toHaveBeenCalledWith('123');
    expect(toOutput).toHaveBeenCalledWith({ results: [{ id: 'att1' }, { id: 'att2' }] });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getAttachments.mockRejectedValue(new Error('fail'));
    const result = await downloadAllAttachments(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('delete-attachment', () => {
  it('should delete an attachment', async () => {
    mockConfluence.deleteAttachment.mockResolvedValue(undefined);
    const ctx = makeContext({ attachmentId: 'att1' });
    const result = await deleteAttachment(ctx);
    expect(mockConfluence.deleteAttachment).toHaveBeenCalledWith('att1');
    expect(toOutput).toHaveBeenCalledWith({ success: true, attachmentId: 'att1' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.deleteAttachment.mockRejectedValue(new Error('fail'));
    const result = await deleteAttachment(makeContext({ attachmentId: 'att1' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-page-images', () => {
  it('should get image attachments for a page', async () => {
    mockConfluence.getPageImages.mockResolvedValue({
      results: [{ id: 'img1', title: 'screenshot.png' }],
    });
    const ctx = makeContext({ pageId: '123' });
    const result = await getPageImages(ctx);
    expect(mockConfluence.getPageImages).toHaveBeenCalledWith('123');
    expect(toOutput).toHaveBeenCalledWith({
      results: [{ id: 'img1', title: 'screenshot.png' }],
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getPageImages.mockRejectedValue(new Error('fail'));
    const result = await getPageImages(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
