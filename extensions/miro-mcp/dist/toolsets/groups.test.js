import { describe, it, expect, vi } from 'vitest';
import { createGroupsToolset } from './groups.js';
describe('createGroupsToolset', () => {
  function createMockClient() {
    return {
      listGroups: vi.fn().mockResolvedValue([{ id: 'g1' }]),
      getGroup: vi.fn().mockResolvedValue({ id: 'g1' }),
      createGroup: vi.fn().mockResolvedValue({ id: 'g1' }),
      updateGroup: vi.fn().mockResolvedValue({ id: 'g1' }),
      deleteGroup: vi.fn().mockResolvedValue(undefined),
      getGroupItems: vi.fn().mockResolvedValue([{ id: 'item1' }]),
      ungroupItems: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 7 tools with correct names', () => {
    const toolset = createGroupsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(7);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_list_groups',
      'miro_get_group',
      'miro_create_group',
      'miro_update_group',
      'miro_delete_group',
      'miro_get_group_items',
      'miro_ungroup_items',
    ]);
  });
  it('sets toolset name', () => {
    const toolset = createGroupsToolset(createMockClient());
    expect(toolset.name).toBe('miro_groups');
  });
  it('list handler calls client.listGroups', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_list_groups']({ boardId: 'b1' });
    expect(client.listGroups).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
  });
  it('get handler calls client.getGroup', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_get_group']({
      boardId: 'b1',
      groupId: 'g1',
    });
    expect(client.getGroup).toHaveBeenCalledWith('b1', 'g1');
    expect(result.isError).toBeUndefined();
  });
  it('create handler calls client.createGroup', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const data = { items: ['item1', 'item2'] };
    const result = await toolset.handlers['miro_create_group']({ boardId: 'b1', data });
    expect(client.createGroup).toHaveBeenCalledWith('b1', data);
    expect(result.isError).toBeUndefined();
  });
  it('update handler calls client.updateGroup', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const data = { items: ['item1', 'item3'] };
    const result = await toolset.handlers['miro_update_group']({
      boardId: 'b1',
      groupId: 'g1',
      data,
    });
    expect(client.updateGroup).toHaveBeenCalledWith('b1', 'g1', data);
    expect(result.isError).toBeUndefined();
  });
  it('delete handler calls client.deleteGroup', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_delete_group']({
      boardId: 'b1',
      groupId: 'g1',
    });
    expect(client.deleteGroup).toHaveBeenCalledWith('b1', 'g1');
    expect(result.content[0].text).toBe('Deleted successfully');
  });
  it('getGroupItems handler calls client.getGroupItems', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_get_group_items']({
      boardId: 'b1',
      groupId: 'g1',
    });
    expect(client.getGroupItems).toHaveBeenCalledWith('b1', 'g1');
    expect(result.isError).toBeUndefined();
  });
  it('ungroup handler calls client.ungroupItems', async () => {
    const client = createMockClient();
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_ungroup_items']({
      boardId: 'b1',
      groupId: 'g1',
    });
    expect(client.ungroupItems).toHaveBeenCalledWith('b1', 'g1');
    expect(result.content[0].text).toBe('Items ungrouped successfully');
  });
  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.listGroups).mockRejectedValueOnce(new Error('API failure'));
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_list_groups']({ boardId: 'b1' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('API failure');
  });
  it('handler handles non-Error throws', async () => {
    const client = createMockClient();
    vi.mocked(client.createGroup).mockRejectedValueOnce('string error');
    const toolset = createGroupsToolset(client);
    const result = await toolset.handlers['miro_create_group']({
      boardId: 'b1',
      data: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('string error');
  });
});
