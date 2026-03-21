import { describe, it, expect, vi } from 'vitest';
import { createAppCardsToolset } from './app-cards.js';
describe('createAppCardsToolset', () => {
  function createMockClient() {
    return {
      createAppCard: vi.fn().mockResolvedValue({ id: 'ac1' }),
      getAppCard: vi.fn().mockResolvedValue({ id: 'ac1' }),
      updateAppCard: vi.fn().mockResolvedValue({ id: 'ac1' }),
      deleteAppCard: vi.fn().mockResolvedValue(undefined),
    };
  }
  it('creates 4 tools', () => {
    const toolset = createAppCardsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_app_cards');
  });
  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createAppCardsToolset(client);
    await toolset.handlers['miro_create_app_card']({ boardId: 'b1', data: { content: 'test' } });
    expect(client.createAppCard).toHaveBeenCalledWith('b1', { content: 'test' });
  });
  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createAppCardsToolset(client);
    await toolset.handlers['miro_get_app_card']({ boardId: 'b1', itemId: 'ac1' });
    expect(client.getAppCard).toHaveBeenCalledWith('b1', 'ac1');
  });
  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createAppCardsToolset(client);
    await toolset.handlers['miro_delete_app_card']({ boardId: 'b1', itemId: 'ac1' });
    expect(client.deleteAppCard).toHaveBeenCalledWith('b1', 'ac1');
  });
});
