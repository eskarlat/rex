import { describe, it, expect, vi } from 'vitest';
import { createFramesToolset } from './frames.js';
describe('createFramesToolset', () => {
  function createMockClient() {
    return {
      createFrame: vi.fn().mockResolvedValue({ id: 'f1' }),
      getFrame: vi.fn().mockResolvedValue({ id: 'f1' }),
      updateFrame: vi.fn().mockResolvedValue({ id: 'f1' }),
      deleteFrame: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 4 tools', () => {
    const toolset = createFramesToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_frames');
  });
  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createFramesToolset(client);
    await toolset.handlers['miro_create_frame']({ boardId: 'b1', data: { content: 'test' } });
    expect(client.createFrame).toHaveBeenCalledWith('b1', { content: 'test' });
  });
  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createFramesToolset(client);
    await toolset.handlers['miro_get_frame']({ boardId: 'b1', itemId: 'f1' });
    expect(client.getFrame).toHaveBeenCalledWith('b1', 'f1');
  });
  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createFramesToolset(client);
    await toolset.handlers['miro_delete_frame']({ boardId: 'b1', itemId: 'f1' });
    expect(client.deleteFrame).toHaveBeenCalledWith('b1', 'f1');
  });
});
