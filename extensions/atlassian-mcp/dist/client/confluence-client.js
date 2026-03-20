import { AtlassianBaseClient } from './base-client.js';
export class ConfluenceClient extends AtlassianBaseClient {
    constructor(config) {
        super(config);
    }
    // --- Pages ---
    async search(cql, limit = 25, start = 0) {
        const params = new URLSearchParams({ cql, limit: String(limit), start: String(start) });
        return this.request('GET', `/wiki/rest/api/content/search?${params.toString()}`);
    }
    async getPage(pageId, expand = 'body.storage,version') {
        return this.request('GET', `/wiki/rest/api/content/${pageId}?expand=${encodeURIComponent(expand)}`);
    }
    async getPageChildren(pageId, limit = 25, start = 0) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/page?limit=${limit}&start=${start}`);
    }
    async getPageHistory(pageId) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/history`);
    }
    async createPage(page) {
        return this.request('POST', '/wiki/rest/api/content', page);
    }
    async updatePage(pageId, page) {
        return this.request('PUT', `/wiki/rest/api/content/${pageId}`, page);
    }
    async deletePage(pageId) {
        return this.request('DELETE', `/wiki/rest/api/content/${pageId}`);
    }
    async movePage(pageId, targetAncestorId, currentVersion) {
        return this.request('PUT', `/wiki/rest/api/content/${pageId}`, {
            type: 'page',
            ancestors: [{ id: targetAncestorId }],
            version: { number: currentVersion + 1 },
        });
    }
    async getPageVersion(pageId, version) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}?expand=body.storage&status=historical&version=${version}`);
    }
    // --- Comments ---
    async getComments(pageId, limit = 25, start = 0) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/comment?expand=body.storage&limit=${limit}&start=${start}`);
    }
    async addComment(pageId, body) {
        return this.request('POST', '/wiki/rest/api/content', {
            type: 'comment',
            container: { id: pageId, type: 'page' },
            body: { storage: { value: body, representation: 'storage' } },
        });
    }
    async replyToComment(pageId, parentCommentId, body) {
        return this.request('POST', '/wiki/rest/api/content', {
            type: 'comment',
            container: { id: pageId, type: 'page' },
            ancestors: [{ id: parentCommentId }],
            body: { storage: { value: body, representation: 'storage' } },
        });
    }
    // --- Labels ---
    async getLabels(pageId) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/label`);
    }
    async addLabel(pageId, labels) {
        return this.request('POST', `/wiki/rest/api/content/${pageId}/label`, labels);
    }
    // --- Users ---
    async searchUser(query) {
        return this.request('GET', `/wiki/rest/api/search/user?cql=${encodeURIComponent(`user.fullname~"${query}"`)}`);
    }
    // --- Analytics ---
    async getPageViews(pageId) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/history`);
    }
    // --- Attachments ---
    async uploadAttachment(pageId, filename, content) {
        return this.request('POST', `/wiki/rest/api/content/${pageId}/child/attachment`, { filename, content }, { 'X-Atlassian-Token': 'nocheck' });
    }
    async getAttachments(pageId, limit = 25, start = 0) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/attachment?limit=${limit}&start=${start}`);
    }
    async downloadAttachment(pageId, filename) {
        return this.requestRaw('GET', `/wiki/download/attachments/${pageId}/${encodeURIComponent(filename)}`);
    }
    async deleteAttachment(attachmentId) {
        return this.request('DELETE', `/wiki/rest/api/content/${attachmentId}`);
    }
    async getPageImages(pageId) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/attachment?mediaType=image&expand=metadata`);
    }
}
