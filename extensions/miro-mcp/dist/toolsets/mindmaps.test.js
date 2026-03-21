import { describe, it, expect, vi } from 'vitest';
import { createMindmapsToolset } from './mindmaps.js';
describe('createMindmapsToolset', () => {
  function createMockClient() {
    return {
      createMindmapNode: vi.fn().mockResolvedValue({ id: 'mn1' }),
      getMindmapNode: vi.fn().mockResolvedValue({ id: 'mn1' }),
      updateMindmapNode: vi.fn().mockResolvedValue({ id: 'mn1' }),
      deleteMindmapNode: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 4 tools', () => {
    const toolset = createMindmapsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_mindmaps');
  });
  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createMindmapsToolset(client);
    await toolset.handlers['miro_create_mindmap_node']({
      boardId: 'b1',
      data: { content: 'test' },
    });
    expect(client.createMindmapNode).toHaveBeenCalledWith('b1', { content: 'test' });
  });
  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createMindmapsToolset(client);
    await toolset.handlers['miro_get_mindmap_node']({ boardId: 'b1', itemId: 'mn1' });
    expect(client.getMindmapNode).toHaveBeenCalledWith('b1', 'mn1');
  });
  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createMindmapsToolset(client);
    await toolset.handlers['miro_delete_mindmap_node']({ boardId: 'b1', itemId: 'mn1' });
    expect(client.deleteMindmapNode).toHaveBeenCalledWith('b1', 'mn1');
  });
});
