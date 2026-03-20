import { describe, it, expect, vi } from 'vitest';
import { createShapesToolset } from './shapes.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createShapesToolset', () => {
  function createMockClient(): MiroClient {
    return {
      createShape: vi.fn().mockResolvedValue({ id: 's1' }),
      getShape: vi.fn().mockResolvedValue({ id: 's1' }),
      updateShape: vi.fn().mockResolvedValue({ id: 's1' }),
      deleteShape: vi.fn().mockResolvedValue(undefined),
    } as unknown as MiroClient;
  }

  it('creates 4 tools', () => {
    const toolset = createShapesToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_shapes');
  });

  it('create handler calls client', async () => {
    const client = createMockClient();
    const toolset = createShapesToolset(client);
    await toolset.handlers['miro_create_shape']!({ boardId: 'b1', data: { content: 'test' } });
    expect(client.createShape).toHaveBeenCalledWith('b1', { content: 'test' });
  });

  it('get handler calls client', async () => {
    const client = createMockClient();
    const toolset = createShapesToolset(client);
    await toolset.handlers['miro_get_shape']!({ boardId: 'b1', itemId: 's1' });
    expect(client.getShape).toHaveBeenCalledWith('b1', 's1');
  });

  it('delete handler calls client', async () => {
    const client = createMockClient();
    const toolset = createShapesToolset(client);
    await toolset.handlers['miro_delete_shape']!({ boardId: 'b1', itemId: 's1' });
    expect(client.deleteShape).toHaveBeenCalledWith('b1', 's1');
  });
});
