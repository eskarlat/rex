import { AtlassianBaseClient } from './base-client.js';
import type { AtlassianClientConfig } from './base-client.js';
export declare class ConfluenceClient extends AtlassianBaseClient {
    constructor(config: AtlassianClientConfig);
    search(cql: string, limit?: number, start?: number): Promise<unknown>;
    getPage(pageId: string, expand?: string): Promise<unknown>;
    getPageChildren(pageId: string, limit?: number, start?: number): Promise<unknown>;
    getPageHistory(pageId: string): Promise<unknown>;
    createPage(page: Record<string, unknown>): Promise<unknown>;
    updatePage(pageId: string, page: Record<string, unknown>): Promise<unknown>;
    deletePage(pageId: string): Promise<unknown>;
    movePage(pageId: string, targetAncestorId: string, currentVersion: number): Promise<unknown>;
    getPageVersion(pageId: string, version: number): Promise<unknown>;
    getComments(pageId: string, limit?: number, start?: number): Promise<unknown>;
    addComment(pageId: string, body: string): Promise<unknown>;
    replyToComment(pageId: string, parentCommentId: string, body: string): Promise<unknown>;
    getLabels(pageId: string): Promise<unknown>;
    addLabel(pageId: string, labels: Array<{
        name: string;
    }>): Promise<unknown>;
    searchUser(query: string): Promise<unknown>;
    getPageViews(pageId: string, fromDate?: string): Promise<unknown>;
    getPageViewers(pageId: string, fromDate?: string): Promise<unknown>;
    uploadAttachment(pageId: string, filename: string, content: string): Promise<unknown>;
    getAttachments(pageId: string, limit?: number, start?: number): Promise<unknown>;
    downloadAttachment(pageId: string, filename: string): Promise<Response>;
    downloadAttachmentById(attachmentId: string): Promise<Response>;
    deleteAttachment(attachmentId: string): Promise<unknown>;
    getPageImages(pageId: string): Promise<unknown>;
}
