import { describe, it, expect, vi } from 'vitest';
import { createConnectorsToolset } from './connectors.js';
describe('createConnectorsToolset', () => {
  function createMockClient() {
    return {
      listConnectors: vi.fn().mockResolvedValue([{ id: 'c1' }]),
      createConnector: vi.fn().mockResolvedValue({ id: 'c1' }),
      getConnector: vi.fn().mockResolvedValue({ id: 'c1', startItem: { id: 's1' } }),
      updateConnector: vi.fn().mockResolvedValue({ id: 'c1' }),
      deleteConnector: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 5 tools with correct names', () => {
    const toolset = createConnectorsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(5);
    expect(toolset.tools.map((t) => t.name)).toEqual([
      'miro_list_connectors',
      'miro_create_connector',
      'miro_get_connector',
      'miro_update_connector',
      'miro_delete_connector',
    ]);
  });
  it('sets toolset name', () => {
    const toolset = createConnectorsToolset(createMockClient());
    expect(toolset.name).toBe('miro_connectors');
  });
  it('list handler calls client.listConnectors', async () => {
    const client = createMockClient();
    const toolset = createConnectorsToolset(client);
    const result = await toolset.handlers['miro_list_connectors']({ boardId: 'b1' });
    expect(client.listConnectors).toHaveBeenCalledWith('b1');
    expect(result.isError).toBeUndefined();
  });
  it('create handler calls client.createConnector', async () => {
    const client = createMockClient();
    const toolset = createConnectorsToolset(client);
    const data = { startItem: { id: 's1' }, endItem: { id: 'e1' } };
    const result = await toolset.handlers['miro_create_connector']({ boardId: 'b1', data });
    expect(client.createConnector).toHaveBeenCalledWith('b1', data);
    expect(result.isError).toBeUndefined();
  });
  it('get handler calls client.getConnector', async () => {
    const client = createMockClient();
    const toolset = createConnectorsToolset(client);
    const result = await toolset.handlers['miro_get_connector']({
      boardId: 'b1',
      connectorId: 'c1',
    });
    expect(client.getConnector).toHaveBeenCalledWith('b1', 'c1');
    expect(result.isError).toBeUndefined();
  });
  it('update handler calls client.updateConnector', async () => {
    const client = createMockClient();
    const toolset = createConnectorsToolset(client);
    const data = { style: { color: '#ff0000' } };
    const result = await toolset.handlers['miro_update_connector']({
      boardId: 'b1',
      connectorId: 'c1',
      data,
    });
    expect(client.updateConnector).toHaveBeenCalledWith('b1', 'c1', data);
    expect(result.isError).toBeUndefined();
  });
  it('delete handler calls client.deleteConnector', async () => {
    const client = createMockClient();
    const toolset = createConnectorsToolset(client);
    const result = await toolset.handlers['miro_delete_connector']({
      boardId: 'b1',
      connectorId: 'c1',
    });
    expect(client.deleteConnector).toHaveBeenCalledWith('b1', 'c1');
    expect(result.content[0].text).toBe('Deleted successfully');
  });
  it('handler returns errorResult on failure', async () => {
    const client = createMockClient();
    vi.mocked(client.listConnectors).mockRejectedValueOnce(new Error('API failure'));
    const toolset = createConnectorsToolset(client);
    const result = await toolset.handlers['miro_list_connectors']({ boardId: 'b1' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('API failure');
  });
  it('handler handles non-Error throws', async () => {
    const client = createMockClient();
    vi.mocked(client.createConnector).mockRejectedValueOnce('string error');
    const toolset = createConnectorsToolset(client);
    const result = await toolset.handlers['miro_create_connector']({
      boardId: 'b1',
      data: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('string error');
  });
});
