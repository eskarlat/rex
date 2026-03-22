import { AtlassianBaseClient } from './base-client.js';
import type { AtlassianClientConfig } from './base-client.js';

export class ConfluenceClient extends AtlassianBaseClient {
  constructor(config: AtlassianClientConfig) {
    super(config);
  }

  // --- Pages ---
  async search(cql: string, limit = 25, start = 0): Promise<unknown> {
    const params = new URLSearchParams({ cql, limit: String(limit), start: String(start) });
    return this.request('GET', `/wiki/rest/api/search?${params.toString()}`);
  }

  async getPage(pageId: string, expand = 'body.storage,version'): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}?expand=${encodeURIComponent(expand)}`,
    );
  }

  async getPageChildren(pageId: string, limit = 25, start = 0): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}/child/page?limit=${limit}&start=${start}`,
    );
  }

  async getPageHistory(pageId: string): Promise<unknown> {
    return this.request('GET', `/wiki/rest/api/content/${pageId}/history`);
  }

  async createPage(page: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/wiki/rest/api/content', page);
  }

  async updatePage(pageId: string, page: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/wiki/rest/api/content/${pageId}`, page);
  }

  async deletePage(pageId: string): Promise<unknown> {
    return this.request('DELETE', `/wiki/rest/api/content/${pageId}`);
  }

  async movePage(
    pageId: string,
    targetAncestorId: string,
    currentVersion: number,
  ): Promise<unknown> {
    return this.request('PUT', `/wiki/rest/api/content/${pageId}`, {
      type: 'page',
      ancestors: [{ id: targetAncestorId }],
      version: { number: currentVersion + 1 },
    });
  }

  async getPageVersion(pageId: string, version: number): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}?expand=body.storage&status=historical&version=${version}`,
    );
  }

  // --- Comments ---
  async getComments(pageId: string, limit = 25, start = 0): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}/child/comment?expand=body.storage&limit=${limit}&start=${start}`,
    );
  }

  async addComment(pageId: string, body: string): Promise<unknown> {
    return this.request('POST', '/wiki/rest/api/content', {
      type: 'comment',
      container: { id: pageId, type: 'page' },
      body: { storage: { value: body, representation: 'storage' } },
    });
  }

  async replyToComment(pageId: string, parentCommentId: string, body: string): Promise<unknown> {
    return this.request('POST', '/wiki/rest/api/content', {
      type: 'comment',
      container: { id: pageId, type: 'page' },
      ancestors: [{ id: parentCommentId }],
      body: { storage: { value: body, representation: 'storage' } },
    });
  }

  // --- Labels ---
  async getLabels(pageId: string): Promise<unknown> {
    return this.request('GET', `/wiki/rest/api/content/${pageId}/label`);
  }

  async addLabel(pageId: string, labels: Array<{ name: string }>): Promise<unknown> {
    return this.request('POST', `/wiki/rest/api/content/${pageId}/label`, labels);
  }

  // --- Users ---
  async searchUser(query: string): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/search/user?cql=${encodeURIComponent('user.fullname~"' + query + '"')}`,
    );
  }

  // --- Analytics ---
  async getPageViews(pageId: string, fromDate?: string): Promise<unknown> {
    const params = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : '';
    return this.request('GET', `/wiki/rest/api/analytics/content/${pageId}/views${params}`);
  }

  async getPageViewers(pageId: string, fromDate?: string): Promise<unknown> {
    const params = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : '';
    return this.request('GET', `/wiki/rest/api/analytics/content/${pageId}/viewers${params}`);
  }

  // --- Attachments ---
  async uploadAttachment(pageId: string, filename: string, content: string): Promise<unknown> {
    const formData = new FormData();
    const blob = new Blob([content]);
    formData.append('file', blob, filename);
    return this.requestFormData(`/wiki/rest/api/content/${pageId}/child/attachment`, formData);
  }

  async getAttachments(pageId: string, limit = 25, start = 0): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}/child/attachment?limit=${limit}&start=${start}`,
    );
  }

  async downloadAttachment(pageId: string, filename: string): Promise<Response> {
    const data = (await this.getAttachments(pageId, 100)) as Record<string, unknown>;
    const results = (data['results'] ?? []) as Array<Record<string, unknown>>;
    const attachment = results.find((a) => a['title'] === filename);
    if (!attachment) {
      throw new Error(`Attachment "${filename}" not found on page ${pageId}`);
    }
    return this.requestRaw('GET', `/wiki/rest/api/content/${attachment['id'] as string}/download`);
  }

  async downloadAttachmentById(attachmentId: string): Promise<Response> {
    return this.requestRaw('GET', `/wiki/rest/api/content/${attachmentId}/download`);
  }

  async deleteAttachment(attachmentId: string): Promise<unknown> {
    return this.request('DELETE', `/wiki/rest/api/content/${attachmentId}`);
  }

  async getPageImages(pageId: string): Promise<unknown> {
    return this.request(
      'GET',
      `/wiki/rest/api/content/${pageId}/child/attachment?mediaType=image&expand=metadata`,
    );
  }
}
