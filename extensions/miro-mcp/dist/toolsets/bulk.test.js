import { describe, it, expect, vi } from 'vitest';
import { createBulkToolset } from './bulk.js';
function createMockClient() {
    return {
        createItemsInBulk: vi
            .fn()
            .mockResolvedValue([{ id: 'item1' }, { id: 'item2' }]),
        createItemsInBulkUsingFile: vi
            .fn()
            .mockResolvedValue({ status: 'created', count: 5 }),
    };
}
describe('createBulkToolset', () => {
    it('creates 2 tools with correct names', () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        expect(toolset.tools).toHaveLength(2);
        expect(toolset.tools.map((t) => t.name)).toEqual([
            'miro_create_items_in_bulk',
            'miro_create_items_in_bulk_using_file',
        ]);
    });
    it('creates 2 handlers', () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        expect(Object.keys(toolset.handlers)).toHaveLength(2);
    });
    it('sets toolset name', () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        expect(toolset.name).toBe('miro_bulk');
    });
    it('create_items_in_bulk handler calls client.createItemsInBulk', async () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        const items = [
            { type: 'sticky_note', data: { content: 'Note 1' } },
            { type: 'sticky_note', data: { content: 'Note 2' } },
        ];
        const result = await toolset.handlers['miro_create_items_in_bulk']({
            boardId: 'b1',
            items,
        });
        expect(client.createItemsInBulk).toHaveBeenCalledWith('b1', items);
        expect(result.isError).toBeUndefined();
        expect(result.content[0].text).toContain('item1');
        expect(result.content[0].text).toContain('item2');
    });
    it('create_items_in_bulk_using_file handler calls client with FormData', async () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        const result = await toolset.handlers['miro_create_items_in_bulk_using_file']({
            boardId: 'b1',
            fileUrl: 'https://example.com/items.csv',
        });
        expect(client.createItemsInBulkUsingFile).toHaveBeenCalledWith('b1', expect.any(FormData));
        const callArgs = vi.mocked(client.createItemsInBulkUsingFile).mock.calls[0];
        const formData = callArgs[1];
        expect(formData.get('url')).toBe('https://example.com/items.csv');
        expect(result.isError).toBeUndefined();
        expect(result.content[0].text).toContain('created');
    });
    it('handler returns errorResult on failure', async () => {
        const client = createMockClient();
        vi.mocked(client.createItemsInBulk).mockRejectedValueOnce(new Error('Bulk limit exceeded'));
        const toolset = createBulkToolset(client);
        const result = await toolset.handlers['miro_create_items_in_bulk']({
            boardId: 'b1',
            items: [],
        });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('Bulk limit exceeded');
    });
    it('handler returns errorResult for non-Error thrown values', async () => {
        const client = createMockClient();
        vi.mocked(client.createItemsInBulkUsingFile).mockRejectedValueOnce('upload failed');
        const toolset = createBulkToolset(client);
        const result = await toolset.handlers['miro_create_items_in_bulk_using_file']({
            boardId: 'b1',
            fileUrl: 'https://example.com/items.csv',
        });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('upload failed');
    });
    it('tools have correct input schemas', () => {
        const client = createMockClient();
        const toolset = createBulkToolset(client);
        const bulkTool = toolset.tools[0];
        expect(bulkTool.inputSchema.required).toEqual(['boardId', 'items']);
        const fileTool = toolset.tools[1];
        expect(fileTool.inputSchema.required).toEqual(['boardId', 'fileUrl']);
    });
});
