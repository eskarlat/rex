import { describe, it, expect, vi } from 'vitest';
import { createCardsToolset } from './cards.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createCardsToolset', () => {
  function createMockClient(): MiroClient {
    return {
      createCard: vi.fn().mockResolvedValue({ id: 'c1' }),
      getCard: vi.fn().mockResolvedValue({ id: 'c1' }),
      updateCard: vi.fn().mockResolvedValue({ id: 'c1' }),
      deleteCard: vi.fn().mockResolvedValue(undefined),
    } as unknown as MiroClient;
  }

  it('creates 4 tools', () => {
    const toolset = createCardsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_cards');
  });

  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createCardsToolset(client);
    await toolset.handlers['miro_create_card']!({ boardId: 'b1', data: { content: 'test' } });
    expect(client.createCard).toHaveBeenCalledWith('b1', { content: 'test' });
  });

  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createCardsToolset(client);
    await toolset.handlers['miro_get_card']!({ boardId: 'b1', itemId: 'c1' });
    expect(client.getCard).toHaveBeenCalledWith('b1', 'c1');
  });

  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createCardsToolset(client);
    await toolset.handlers['miro_delete_card']!({ boardId: 'b1', itemId: 'c1' });
    expect(client.deleteCard).toHaveBeenCalledWith('b1', 'c1');
  });
});
