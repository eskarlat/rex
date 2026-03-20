import { describe, it, expect, vi } from 'vitest';
import { createStickyNotesToolset } from './sticky-notes.js';
describe('createStickyNotesToolset', () => {
    function createMockClient() {
        return {
            createStickyNote: vi.fn().mockResolvedValue({ id: 'sn1' }),
            getStickyNote: vi.fn().mockResolvedValue({ id: 'sn1' }),
            updateStickyNote: vi.fn().mockResolvedValue({ id: 'sn1' }),
            deleteStickyNote: vi.fn().mockResolvedValue(undefined),
        };
    }
    it('creates 4 tools', () => {
        const toolset = createStickyNotesToolset(createMockClient());
        expect(toolset.tools).toHaveLength(4);
        expect(toolset.name).toBe('miro_sticky_notes');
    });
    it('create handler calls client', async () => {
        const client = createMockClient();
        const toolset = createStickyNotesToolset(client);
        await toolset.handlers['miro_create_sticky_note']({
            boardId: 'b1',
            data: { content: 'test' },
        });
        expect(client.createStickyNote).toHaveBeenCalledWith('b1', { content: 'test' });
    });
    it('get handler calls client', async () => {
        const client = createMockClient();
        const toolset = createStickyNotesToolset(client);
        await toolset.handlers['miro_get_sticky_note']({ boardId: 'b1', itemId: 'sn1' });
        expect(client.getStickyNote).toHaveBeenCalledWith('b1', 'sn1');
    });
    it('delete handler calls client', async () => {
        const client = createMockClient();
        const toolset = createStickyNotesToolset(client);
        await toolset.handlers['miro_delete_sticky_note']({ boardId: 'b1', itemId: 'sn1' });
        expect(client.deleteStickyNote).toHaveBeenCalledWith('b1', 'sn1');
    });
});
