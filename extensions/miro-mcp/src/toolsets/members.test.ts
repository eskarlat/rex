import { describe, it, expect, vi } from 'vitest';
import { createMembersToolset } from './members.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createMembersToolset', () => {
  function createMockClient(): MiroClient {
    return {
      listBoardMembers: vi.fn().mockResolvedValue([{ id: 'm1', role: 'editor' }]),
      getBoardMember: vi.fn().mockResolvedValue({ id: 'm1', role: 'editor' }),
      updateBoardMember: vi.fn().mockResolvedValue({ id: 'm1', role: 'viewer' }),
      removeBoardMember: vi.fn().mockResolvedValue(undefined),
      shareBoard: vi.fn().mockResolvedValue({ id: 'm2' }),
    } as unknown as MiroClient;
  }

  it('creates 5 tools with correct names', () => {
    const toolset = createMembersToolset(createMockClient());
    expect(toolset.tools).toHaveLength(5);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_list_board_members',
      'miro_get_board_member',
      'miro_update_board_member',
      'miro_remove_board_member',
      'miro_share_board',
    ]);
  });

  it('sets toolset name', () => {
    const toolset = createMembersToolset(createMockClient());
    expect(toolset.name).toBe('miro_members');
  });

  it('list handler calls client.listBoardMembers', async () => {
    const client = createMockClient();
    const toolset = createMembersToolset(client);
    const result = await toolset.handlers['miro_list_board_members']!({ boardId: 'b1' });
    expect(client.listBoardMembers).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
  });

  it('get handler calls client.getBoardMember', async () => {
    const client = createMockClient();
    const toolset = createMembersToolset(client);
    const result = await toolset.handlers['miro_get_board_member']!({
      boardId: 'b1',
      memberId: 'm1',
    });
    expect(client.getBoardMember).toHaveBeenCalledWith('b1', 'm1');
    expect(result.isError).toBeUndefined();
  });

  it('update handler calls client.updateBoardMember', async () => {
    const client = createMockClient();
    const toolset = createMembersToolset(client);
    const data = { role: 'viewer' };
    const result = await toolset.handlers['miro_update_board_member']!({
      boardId: 'b1',
      memberId: 'm1',
      data,
    });
    expect(client.updateBoardMember).toHaveBeenCalledWith('b1', 'm1', data);
    expect(result.isError).toBeUndefined();
  });

  it('remove handler calls client.removeBoardMember', async () => {
    const client = createMockClient();
    const toolset = createMembersToolset(client);
    const result = await toolset.handlers['miro_remove_board_member']!({
      boardId: 'b1',
      memberId: 'm1',
    });
    expect(client.removeBoardMember).toHaveBeenCalledWith('b1', 'm1');
    expect(result.content[0]!.text).toBe('Success');
  });

  it('share handler calls client.shareBoard', async () => {
    const client = createMockClient();
    const toolset = createMembersToolset(client);
    const data = { emails: ['user@example.com'], role: 'editor' };
    const result = await toolset.handlers['miro_share_board']!({ boardId: 'b1', data });
    expect(client.shareBoard).toHaveBeenCalledWith('b1', data);
    expect(result.isError).toBeUndefined();
  });

  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.listBoardMembers).mockRejectedValueOnce(new Error('API failure'));
    const toolset = createMembersToolset(client);
    const result = await toolset.handlers['miro_list_board_members']!({ boardId: 'b1' });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('API failure');
  });

  it('handler handles non-Error throws', async () => {
    const client = createMockClient();
    vi.mocked(client.shareBoard).mockRejectedValueOnce('string error');
    const toolset = createMembersToolset(client);
    const result = await toolset.handlers['miro_share_board']!({
      boardId: 'b1',
      data: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('string error');
  });
});
