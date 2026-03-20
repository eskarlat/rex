import { describe, it, expect, vi } from 'vitest';
import { createItemsToolset } from './items.js';
import type { MiroClient } from '../client/miro-client.js';

function createMockClient(): MiroClient {
  return {
    getItems: vi.fn().mockResolvedValue([{ id: 'item1', type: 'sticky_note' }]),
    getItem: vi.fn().mockResolvedValue({ id: 'item1', type: 'sticky_note' }),
    updateItemPosition: vi
      .fn()
      .mockResolvedValue({ id: 'item1', position: { x: 100, y: 200 } }),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  } as unknown as MiroClient;
}

describe('createItemsToolset', () => {
  it('creates 4 tools with correct names', () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_get_items',
      'miro_get_item',
      'miro_update_item_position',
      'miro_delete_item',
    ]);
  });

  it('creates 4 handlers', () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    expect(Object.keys(toolset.handlers)).toHaveLength(4);
  });

  it('sets toolset name', () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    expect(toolset.name).toBe('miro_items');
  });

  it('get_items handler calls client.getItems with boardId and query', async () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_get_items']!({
      boardId: 'b1',
      query: { limit: '50' },
    });
    expect(client.getItems).toHaveBeenCalledWith('b1', { limit: '50' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain('item1');
  });

  it('get_items handler works without query', async () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_get_items']!({ boardId: 'b1' });
    expect(client.getItems).toHaveBeenCalledWith('b1', undefined);
    expect(result.isError).toBeUndefined();
  });

  it('get_item handler calls client.getItem', async () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_get_item']!({
      boardId: 'b1',
      itemId: 'item1',
    });
    expect(client.getItem).toHaveBeenCalledWith('b1', 'item1');
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain('item1');
  });

  it('update_item_position handler calls client.updateItemPosition', async () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_update_item_position']!({
      boardId: 'b1',
      itemId: 'item1',
      data: { position: { x: 100, y: 200 } },
    });
    expect(client.updateItemPosition).toHaveBeenCalledWith('b1', 'item1', {
      position: { x: 100, y: 200 },
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain('100');
  });

  it('delete_item handler calls client.deleteItem', async () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_delete_item']!({
      boardId: 'b1',
      itemId: 'item1',
    });
    expect(client.deleteItem).toHaveBeenCalledWith('b1', 'item1');
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toBe('Success');
  });

  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.getItems).mockRejectedValueOnce(new Error('Board not found'));
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_get_items']!({ boardId: 'bad-id' });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('Board not found');
  });

  it('handler returns errorResult for non-Error thrown values', async () => {
    const client = createMockClient();
    vi.mocked(client.getItem).mockRejectedValueOnce('unexpected error');
    const toolset = createItemsToolset(client);
    const result = await toolset.handlers['miro_get_item']!({
      boardId: 'b1',
      itemId: 'item1',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('unexpected error');
  });

  it('tools have correct input schemas', () => {
    const client = createMockClient();
    const toolset = createItemsToolset(client);

    const getItemsTool = toolset.tools[0]!;
    expect(getItemsTool.inputSchema.required).toEqual(['boardId']);

    const getItemTool = toolset.tools[1]!;
    expect(getItemTool.inputSchema.required).toEqual(['boardId', 'itemId']);

    const updatePositionTool = toolset.tools[2]!;
    expect(updatePositionTool.inputSchema.required).toEqual(['boardId', 'itemId', 'data']);

    const deleteTool = toolset.tools[3]!;
    expect(deleteTool.inputSchema.required).toEqual(['boardId', 'itemId']);
  });
});
