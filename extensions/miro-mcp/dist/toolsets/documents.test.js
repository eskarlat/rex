import { describe, it, expect, vi } from 'vitest';
import { createDocumentsToolset } from './documents.js';
describe('createDocumentsToolset', () => {
  function createMockClient() {
    return {
      createDocument: vi.fn().mockResolvedValue({ id: 'd1' }),
      getDocument: vi.fn().mockResolvedValue({ id: 'd1' }),
      updateDocument: vi.fn().mockResolvedValue({ id: 'd1' }),
      deleteDocument: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 4 tools', () => {
    const toolset = createDocumentsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_documents');
  });
  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createDocumentsToolset(client);
    await toolset.handlers['miro_create_document']({ boardId: 'b1', data: { content: 'test' } });
    expect(client.createDocument).toHaveBeenCalledWith('b1', { content: 'test' });
  });
  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createDocumentsToolset(client);
    await toolset.handlers['miro_get_document']({ boardId: 'b1', itemId: 'd1' });
    expect(client.getDocument).toHaveBeenCalledWith('b1', 'd1');
  });
  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createDocumentsToolset(client);
    await toolset.handlers['miro_delete_document']({ boardId: 'b1', itemId: 'd1' });
    expect(client.deleteDocument).toHaveBeenCalledWith('b1', 'd1');
  });
});
