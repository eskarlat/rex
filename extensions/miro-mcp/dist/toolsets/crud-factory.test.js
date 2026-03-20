import { describe, it, expect, vi } from 'vitest';
import { createCrudToolset } from './crud-factory.js';
function createMockClient() {
    return {
        createStickyNote: vi.fn().mockResolvedValue({ id: 'sn1' }),
        getStickyNote: vi.fn().mockResolvedValue({ id: 'sn1', data: { content: 'Hello' } }),
        updateStickyNote: vi.fn().mockResolvedValue({ id: 'sn1', data: { content: 'Updated' } }),
        deleteStickyNote: vi.fn().mockResolvedValue(undefined),
    };
}
describe('createCrudToolset', () => {
    const config = {
        toolsetName: 'miro_sticky_notes',
        resourceName: 'sticky note',
        toolPrefix: 'miro',
        resourceSlug: 'sticky_note',
        methodPrefix: 'StickyNote',
        apiPath: 'sticky_notes',
    };
    it('creates 4 tools with correct names', () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        expect(toolset.tools).toHaveLength(4);
        expect(toolset.tools.map((t) => t.name)).toEqual([
            'miro_create_sticky_note',
            'miro_get_sticky_note',
            'miro_update_sticky_note',
            'miro_delete_sticky_note',
        ]);
    });
    it('creates 4 handlers', () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        expect(Object.keys(toolset.handlers)).toHaveLength(4);
    });
    it('create handler calls client method and returns textResult', async () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        const result = await toolset.handlers['miro_create_sticky_note']({
            boardId: 'b1',
            data: { content: 'Hello' },
        });
        expect(client.createStickyNote).toHaveBeenCalledWith('b1', { content: 'Hello' });
        expect(result.isError).toBeUndefined();
        expect(result.content[0].text).toContain('sn1');
    });
    it('get handler calls client method', async () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        const result = await toolset.handlers['miro_get_sticky_note']({
            boardId: 'b1',
            itemId: 'sn1',
        });
        expect(client.getStickyNote).toHaveBeenCalledWith('b1', 'sn1');
        expect(result.isError).toBeUndefined();
    });
    it('update handler calls client method', async () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        const result = await toolset.handlers['miro_update_sticky_note']({
            boardId: 'b1',
            itemId: 'sn1',
            data: { content: 'Updated' },
        });
        expect(client.updateStickyNote).toHaveBeenCalledWith('b1', 'sn1', { content: 'Updated' });
        expect(result.isError).toBeUndefined();
    });
    it('delete handler calls client method', async () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        const result = await toolset.handlers['miro_delete_sticky_note']({
            boardId: 'b1',
            itemId: 'sn1',
        });
        expect(client.deleteStickyNote).toHaveBeenCalledWith('b1', 'sn1');
        expect(result.content[0].text).toBe('Deleted successfully');
    });
    it('handler returns errorResult on failure', async () => {
        const client = createMockClient();
        vi.mocked(client.createStickyNote).mockRejectedValueOnce(new Error('API failure'));
        const toolset = createCrudToolset(config, client);
        const result = await toolset.handlers['miro_create_sticky_note']({
            boardId: 'b1',
            data: {},
        });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('API failure');
    });
    it('tools have correct input schemas', () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        const createTool = toolset.tools[0];
        expect(createTool.inputSchema.required).toEqual(['boardId', 'data']);
        const getTool = toolset.tools[1];
        expect(getTool.inputSchema.required).toEqual(['boardId', 'itemId']);
    });
    it('sets toolset name', () => {
        const client = createMockClient();
        const toolset = createCrudToolset(config, client);
        expect(toolset.name).toBe('miro_sticky_notes');
    });
});
