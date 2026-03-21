import { describe, it, expect, vi } from 'vitest';
import { createBoardsToolset } from './boards.js';
function createMockClient() {
  return {
    listBoards: vi.fn().mockResolvedValue([{ id: 'b1', name: 'Board 1' }]),
    createBoard: vi.fn().mockResolvedValue({ id: 'b2', name: 'New Board' }),
    getBoard: vi.fn().mockResolvedValue({ id: 'b1', name: 'Board 1' }),
    updateBoard: vi.fn().mockResolvedValue({ id: 'b1', name: 'Updated' }),
    deleteBoard: vi.fn().mockResolvedValue(undefined),
    copyBoard: vi.fn().mockResolvedValue({ id: 'b3', name: 'Board 1 (copy)' }),
  };
}
describe('createBoardsToolset', () => {
  it('creates 6 tools with correct names', () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    expect(toolset.tools).toHaveLength(6);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_list_boards',
      'miro_create_board',
      'miro_get_board',
      'miro_update_board',
      'miro_delete_board',
      'miro_copy_board',
    ]);
  });
  it('creates 6 handlers', () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    expect(Object.keys(toolset.handlers)).toHaveLength(6);
  });
  it('sets toolset name', () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    expect(toolset.name).toBe('miro_boards');
  });
  it('list_boards handler calls client.listBoards with query', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_list_boards']({ query: { limit: '10' } });
    expect(client.listBoards).toHaveBeenCalledWith({ limit: '10' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('b1');
  });
  it('list_boards handler works without query', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_list_boards']({});
    expect(client.listBoards).toHaveBeenCalledWith(undefined);
    expect(result.isError).toBeUndefined();
  });
  it('create_board handler calls client.createBoard', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_create_board']({
      data: { name: 'New Board' },
    });
    expect(client.createBoard).toHaveBeenCalledWith({ name: 'New Board' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('b2');
  });
  it('get_board handler calls client.getBoard', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_get_board']({ boardId: 'b1' });
    expect(client.getBoard).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('b1');
  });
  it('update_board handler calls client.updateBoard', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_update_board']({
      boardId: 'b1',
      data: { name: 'Updated' },
    });
    expect(client.updateBoard).toHaveBeenCalledWith('b1', { name: 'Updated' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('Updated');
  });
  it('delete_board handler calls client.deleteBoard', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_delete_board']({ boardId: 'b1' });
    expect(client.deleteBoard).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe('Deleted successfully');
  });
  it('copy_board handler calls client.copyBoard with data', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_copy_board']({
      boardId: 'b1',
      data: { name: 'Copy' },
    });
    expect(client.copyBoard).toHaveBeenCalledWith('b1', { name: 'Copy' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('b3');
  });
  it('copy_board handler works without data', async () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_copy_board']({ boardId: 'b1' });
    expect(client.copyBoard).toHaveBeenCalledWith('b1', undefined);
    expect(result.isError).toBeUndefined();
  });
  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.createBoard).mockRejectedValueOnce(new Error('API failure'));
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_create_board']({ data: {} });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('API failure');
  });
  it('handler returns errorResult for non-Error thrown values', async () => {
    const client = createMockClient();
    vi.mocked(client.getBoard).mockRejectedValueOnce('string error');
    const toolset = createBoardsToolset(client);
    const result = await toolset.handlers['miro_get_board']({ boardId: 'b1' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('string error');
  });
  it('tools have correct input schemas', () => {
    const client = createMockClient();
    const toolset = createBoardsToolset(client);
    const listTool = toolset.tools[0];
    expect(listTool.inputSchema.required).toBeUndefined();
    const createTool = toolset.tools[1];
    expect(createTool.inputSchema.required).toEqual(['data']);
    const getTool = toolset.tools[2];
    expect(getTool.inputSchema.required).toEqual(['boardId']);
    const updateTool = toolset.tools[3];
    expect(updateTool.inputSchema.required).toEqual(['boardId', 'data']);
    const deleteTool = toolset.tools[4];
    expect(deleteTool.inputSchema.required).toEqual(['boardId']);
    const copyTool = toolset.tools[5];
    expect(copyTool.inputSchema.required).toEqual(['boardId']);
  });
});
