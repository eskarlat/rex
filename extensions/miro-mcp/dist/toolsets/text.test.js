import { describe, it, expect, vi } from 'vitest';
import { createTextToolset } from './text.js';
describe('createTextToolset', () => {
    function createMockClient() {
        return {
            createText: vi.fn().mockResolvedValue({ id: 't1' }),
            getText: vi.fn().mockResolvedValue({ id: 't1' }),
            updateText: vi.fn().mockResolvedValue({ id: 't1' }),
            deleteText: vi.fn().mockResolvedValue(undefined),
        };
    }
    it('creates 4 tools', () => {
        const toolset = createTextToolset(createMockClient());
        expect(toolset.tools).toHaveLength(4);
        expect(toolset.name).toBe('miro_text');
    });
    it('create handler calls client', async () => {
        const client = createMockClient();
        const toolset = createTextToolset(client);
        await toolset.handlers['miro_create_text']({ boardId: 'b1', data: { content: 'test' } });
        expect(client.createText).toHaveBeenCalledWith('b1', { content: 'test' });
    });
    it('get handler calls client', async () => {
        const client = createMockClient();
        const toolset = createTextToolset(client);
        await toolset.handlers['miro_get_text']({ boardId: 'b1', itemId: 't1' });
        expect(client.getText).toHaveBeenCalledWith('b1', 't1');
    });
    it('delete handler calls client', async () => {
        const client = createMockClient();
        const toolset = createTextToolset(client);
        await toolset.handlers['miro_delete_text']({ boardId: 'b1', itemId: 't1' });
        expect(client.deleteText).toHaveBeenCalledWith('b1', 't1');
    });
});
