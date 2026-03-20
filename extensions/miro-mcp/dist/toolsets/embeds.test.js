import { describe, it, expect, vi } from 'vitest';
import { createEmbedsToolset } from './embeds.js';
describe('createEmbedsToolset', () => {
    function createMockClient() {
        return {
            createEmbed: vi.fn().mockResolvedValue({ id: 'e1' }),
            getEmbed: vi.fn().mockResolvedValue({ id: 'e1' }),
            updateEmbed: vi.fn().mockResolvedValue({ id: 'e1' }),
            deleteEmbed: vi.fn().mockResolvedValue(undefined),
        };
    }
    it('creates 4 tools', () => {
        const toolset = createEmbedsToolset(createMockClient());
        expect(toolset.tools).toHaveLength(4);
        expect(toolset.name).toBe('miro_embeds');
    });
    it('create handler calls client', async () => {
        const client = createMockClient();
        const toolset = createEmbedsToolset(client);
        await toolset.handlers['miro_create_embed']({ boardId: 'b1', data: { content: 'test' } });
        expect(client.createEmbed).toHaveBeenCalledWith('b1', { content: 'test' });
    });
    it('get handler calls client', async () => {
        const client = createMockClient();
        const toolset = createEmbedsToolset(client);
        await toolset.handlers['miro_get_embed']({ boardId: 'b1', itemId: 'e1' });
        expect(client.getEmbed).toHaveBeenCalledWith('b1', 'e1');
    });
    it('delete handler calls client', async () => {
        const client = createMockClient();
        const toolset = createEmbedsToolset(client);
        await toolset.handlers['miro_delete_embed']({ boardId: 'b1', itemId: 'e1' });
        expect(client.deleteEmbed).toHaveBeenCalledWith('b1', 'e1');
    });
});
