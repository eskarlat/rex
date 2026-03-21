import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createConfluenceAttachmentsToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_attachments',
    tools: [
      {
        name: 'confluence_upload_attachment',
        description: 'Upload an attachment to a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            filename: { type: 'string', description: 'Filename' },
            content: { type: 'string', description: 'File content (base64 or text)' },
          },
          required: ['pageId', 'filename', 'content'],
        },
      },
      {
        name: 'confluence_upload_attachments',
        description: 'Upload multiple attachments to a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            files: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of { filename, content } objects',
            },
          },
          required: ['pageId', 'files'],
        },
      },
      {
        name: 'confluence_get_attachments',
        description: 'Get all attachments on a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            limit: { type: 'number', description: 'Max results' },
            start: { type: 'number', description: 'Pagination start' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_download_attachment',
        description: 'Download an attachment from a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            filename: { type: 'string', description: 'Attachment filename' },
          },
          required: ['pageId', 'filename'],
        },
      },
      {
        name: 'confluence_download_content_attachments',
        description: 'Download all attachments from a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_delete_attachment',
        description: 'Delete an attachment from Confluence.',
        inputSchema: {
          type: 'object',
          properties: {
            attachmentId: { type: 'string', description: 'Attachment content ID' },
          },
          required: ['attachmentId'],
        },
      },
      {
        name: 'confluence_get_page_images',
        description: 'Get all image attachments from a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
    ],
    handlers: {
      confluence_upload_attachment: async (args) => {
        try {
          const data = await client.uploadAttachment(
            args['pageId'] as string,
            args['filename'] as string,
            args['content'] as string,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_upload_attachments: async (args) => {
        try {
          const pageId = args['pageId'] as string;
          const files = args['files'] as Array<{ filename: string; content: string }>;
          const results = [];
          for (const file of files) {
            const data = await client.uploadAttachment(pageId, file.filename, file.content);
            results.push(data);
          }
          return markdownResult(results);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_get_attachments: async (args) => {
        try {
          const data = await client.getAttachments(
            args['pageId'] as string,
            (args['limit'] as number | undefined) ?? 25,
            (args['start'] as number | undefined) ?? 0,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_download_attachment: async (args) => {
        try {
          const res = await client.downloadAttachment(
            args['pageId'] as string,
            args['filename'] as string,
          );
          const text = await res.text();
          return markdownResult({ content: text, contentType: res.headers.get('content-type') });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_download_content_attachments: async (args) => {
        try {
          const data = await client.getAttachments(args['pageId'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_delete_attachment: async (args) => {
        try {
          await client.deleteAttachment(args['attachmentId'] as string);
          return markdownResult({ success: true });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_get_page_images: async (args) => {
        try {
          const data = await client.getPageImages(args['pageId'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
