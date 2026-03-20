import { describe, it, expect, vi } from 'vitest';
import { createImagesToolset } from './images.js';
describe('createImagesToolset', () => {
    function createMockClient() {
        return {
            createImageFromUrl: vi.fn().mockResolvedValue({ id: 'img1' }),
            createImageFromFile: vi.fn().mockResolvedValue({ id: 'img2' }),
            getImage: vi.fn().mockResolvedValue({ id: 'img1' }),
            updateImage: vi.fn().mockResolvedValue({ id: 'img1' }),
            updateImageFromFile: vi.fn().mockResolvedValue({ id: 'img1' }),
            deleteImage: vi.fn().mockResolvedValue(undefined),
            listImagesByBoard: vi.fn().mockResolvedValue([{ id: 'img1' }]),
        };
    }
    it('creates 7 tools', () => {
        const toolset = createImagesToolset(createMockClient());
        expect(toolset.tools).toHaveLength(7);
        expect(toolset.name).toBe('miro_images');
    });
    it('create from URL handler calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        const result = await toolset.handlers['miro_create_image_from_url']({
            boardId: 'b1',
            data: { url: 'https://example.com/img.png' },
        });
        expect(client.createImageFromUrl).toHaveBeenCalledWith('b1', {
            url: 'https://example.com/img.png',
        });
        expect(result.isError).toBeUndefined();
    });
    it('create from file handler creates FormData and calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        const result = await toolset.handlers['miro_create_image_from_file']({
            boardId: 'b1',
            fileUrl: 'https://example.com/img.png',
        });
        expect(client.createImageFromFile).toHaveBeenCalledWith('b1', expect.any(FormData));
        const formData = client.createImageFromFile.mock
            .calls[0][1];
        expect(formData.get('url')).toBe('https://example.com/img.png');
        expect(result.isError).toBeUndefined();
    });
    it('get handler calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        await toolset.handlers['miro_get_image']({ boardId: 'b1', itemId: 'img1' });
        expect(client.getImage).toHaveBeenCalledWith('b1', 'img1');
    });
    it('update handler calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        await toolset.handlers['miro_update_image']({
            boardId: 'b1',
            itemId: 'img1',
            data: { title: 'new' },
        });
        expect(client.updateImage).toHaveBeenCalledWith('b1', 'img1', { title: 'new' });
    });
    it('update from file handler creates FormData and calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        const result = await toolset.handlers['miro_update_image_from_file']({
            boardId: 'b1',
            itemId: 'img1',
            fileUrl: 'https://example.com/new.png',
        });
        expect(client.updateImageFromFile).toHaveBeenCalledWith('b1', 'img1', expect.any(FormData));
        const formData = client.updateImageFromFile.mock
            .calls[0][2];
        expect(formData.get('url')).toBe('https://example.com/new.png');
        expect(result.isError).toBeUndefined();
    });
    it('delete handler calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        await toolset.handlers['miro_delete_image']({ boardId: 'b1', itemId: 'img1' });
        expect(client.deleteImage).toHaveBeenCalledWith('b1', 'img1');
    });
    it('list handler calls client', async () => {
        const client = createMockClient();
        const toolset = createImagesToolset(client);
        await toolset.handlers['miro_list_images']({ boardId: 'b1' });
        expect(client.listImagesByBoard).toHaveBeenCalledWith('b1');
    });
    it('returns error result on failure', async () => {
        const client = createMockClient();
        client.getImage.mockRejectedValue(new Error('Not found'));
        const toolset = createImagesToolset(client);
        const result = await toolset.handlers['miro_get_image']({ boardId: 'b1', itemId: 'x' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('Not found');
    });
});
