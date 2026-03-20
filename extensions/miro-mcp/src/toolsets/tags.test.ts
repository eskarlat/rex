import { describe, it, expect, vi } from 'vitest';
import { createTagsToolset } from './tags.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createTagsToolset', () => {
  function createMockClient(): MiroClient {
    return {
      listTags: vi.fn().mockResolvedValue([{ id: 't1' }]),
      createTag: vi.fn().mockResolvedValue({ id: 't1', title: 'Bug' }),
      getTag: vi.fn().mockResolvedValue({ id: 't1', title: 'Bug' }),
      updateTag: vi.fn().mockResolvedValue({ id: 't1', title: 'Feature' }),
      deleteTag: vi.fn().mockResolvedValue(undefined),
      attachTag: vi.fn().mockResolvedValue(undefined),
      detachTag: vi.fn().mockResolvedValue(undefined),
      getItemTags: vi.fn().mockResolvedValue([{ id: 't1' }]),
    } as unknown as MiroClient;
  }

  it('creates 8 tools with correct names', () => {
    const toolset = createTagsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(8);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_list_tags',
      'miro_create_tag',
      'miro_get_tag',
      'miro_update_tag',
      'miro_delete_tag',
      'miro_attach_tag',
      'miro_detach_tag',
      'miro_get_item_tags',
    ]);
  });

  it('sets toolset name', () => {
    const toolset = createTagsToolset(createMockClient());
    expect(toolset.name).toBe('miro_tags');
  });

  it('list handler calls client.listTags', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_list_tags']!({ boardId: 'b1' });
    expect(client.listTags).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
  });

  it('create handler calls client.createTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const data = { title: 'Bug', fillColor: '#ff0000' };
    const result = await toolset.handlers['miro_create_tag']!({ boardId: 'b1', data });
    expect(client.createTag).toHaveBeenCalledWith('b1', data);
    expect(result.isError).toBeUndefined();
  });

  it('get handler calls client.getTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_get_tag']!({ boardId: 'b1', tagId: 't1' });
    expect(client.getTag).toHaveBeenCalledWith('b1', 't1');
    expect(result.isError).toBeUndefined();
  });

  it('update handler calls client.updateTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const data = { title: 'Feature' };
    const result = await toolset.handlers['miro_update_tag']!({
      boardId: 'b1',
      tagId: 't1',
      data,
    });
    expect(client.updateTag).toHaveBeenCalledWith('b1', 't1', data);
    expect(result.isError).toBeUndefined();
  });

  it('delete handler calls client.deleteTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_delete_tag']!({ boardId: 'b1', tagId: 't1' });
    expect(client.deleteTag).toHaveBeenCalledWith('b1', 't1');
    expect(result.content[0]!.text).toBe('Success');
  });

  it('attach handler calls client.attachTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_attach_tag']!({
      boardId: 'b1',
      itemId: 'i1',
      tagId: 't1',
    });
    expect(client.attachTag).toHaveBeenCalledWith('b1', 'i1', 't1');
    expect(result.content[0]!.text).toBe('Success');
  });

  it('detach handler calls client.detachTag', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_detach_tag']!({
      boardId: 'b1',
      itemId: 'i1',
      tagId: 't1',
    });
    expect(client.detachTag).toHaveBeenCalledWith('b1', 'i1', 't1');
    expect(result.content[0]!.text).toBe('Success');
  });

  it('getItemTags handler calls client.getItemTags', async () => {
    const client = createMockClient();
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_get_item_tags']!({
      boardId: 'b1',
      itemId: 'i1',
    });
    expect(client.getItemTags).toHaveBeenCalledWith('b1', 'i1');
    expect(result.isError).toBeUndefined();
  });

  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.listTags).mockRejectedValueOnce(new Error('API failure'));
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_list_tags']!({ boardId: 'b1' });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('API failure');
  });

  it('handler handles non-Error throws', async () => {
    const client = createMockClient();
    vi.mocked(client.attachTag).mockRejectedValueOnce('string error');
    const toolset = createTagsToolset(client);
    const result = await toolset.handlers['miro_attach_tag']!({
      boardId: 'b1',
      itemId: 'i1',
      tagId: 't1',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('string error');
  });
});
