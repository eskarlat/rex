import { AtlassianBaseClient } from './base-client.js';
export class ConfluenceClient extends AtlassianBaseClient {
    constructor(config) {
        super(config);
    }
    // --- Pages ---
    async search(cql, limit = 25, start = 0) {
        const params = new URLSearchParams({ cql, limit: String(limit), start: String(start) });
        return this.request('GET', `/wiki/rest/api/search?${params.toString()}`);
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
    async getPageViews(pageId, fromDate) {
        const params = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : '';
        return this.request('GET', `/wiki/rest/api/analytics/content/${pageId}/views${params}`);
    }
    async getPageViewers(pageId, fromDate) {
        const params = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : '';
        return this.request('GET', `/wiki/rest/api/analytics/content/${pageId}/viewers${params}`);
    }
    // --- Attachments ---
    async uploadAttachment(pageId, filename, content) {
        const formData = new FormData();
        const blob = new Blob([content]);
        formData.append('file', blob, filename);
        return this.requestFormData(`/wiki/rest/api/content/${pageId}/child/attachment`, formData);
    }
    async getAttachments(pageId, limit = 25, start = 0) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/attachment?limit=${limit}&start=${start}`);
    }
    async downloadAttachment(pageId, filename) {
        const data = (await this.getAttachments(pageId, 100));
        const results = (data['results'] ?? []);
        const attachment = results.find((a) => a['title'] === filename);
        if (!attachment) {
            throw new Error(`Attachment "${filename}" not found on page ${pageId}`);
        }
        return this.requestRaw('GET', `/wiki/rest/api/content/${attachment['id']}/download`);
    }
    async downloadAttachmentById(attachmentId) {
        return this.requestRaw('GET', `/wiki/rest/api/content/${attachmentId}/download`);
    }
    async deleteAttachment(attachmentId) {
        return this.request('DELETE', `/wiki/rest/api/content/${attachmentId}`);
    }
    async getPageImages(pageId) {
        return this.request('GET', `/wiki/rest/api/content/${pageId}/child/attachment?mediaType=image&expand=metadata`);
    }
}
