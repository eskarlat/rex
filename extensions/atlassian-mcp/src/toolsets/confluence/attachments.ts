import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { safeExec, confluencePaginationArgs, pageIdSchema, confluencePaginationSchema } from '../types.js';

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
            ...pageIdSchema,
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
            ...pageIdSchema,
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
          properties: { ...pageIdSchema, ...confluencePaginationSchema },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_download_attachment',
        description: 'Download an attachment from a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            ...pageIdSchema,
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
          properties: { ...pageIdSchema },
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
          properties: { ...pageIdSchema },
          required: ['pageId'],
        },
      },
    ],
    handlers: {
      confluence_upload_attachment: (args) =>
        safeExec(() =>
          client.uploadAttachment(
            args['pageId'] as string,
            args['filename'] as string,
            args['content'] as string,
          ),
        ),
      confluence_upload_attachments: (args) =>
        safeExec(async () => {
          const pageId = args['pageId'] as string;
          const files = args['files'] as Array<{ filename: string; content: string }>;
          const results = [];
          for (const file of files) {
            const data = await client.uploadAttachment(pageId, file.filename, file.content);
            results.push(data);
          }
          return results;
        }),
      confluence_get_attachments: (args) =>
        safeExec(() =>
          client.getAttachments(args['pageId'] as string, ...confluencePaginationArgs(args)),
        ),
      confluence_download_attachment: (args) =>
        safeExec(async () => {
          const res = await client.downloadAttachment(
            args['pageId'] as string,
            args['filename'] as string,
          );
          const text = await res.text();
          return { content: text, contentType: res.headers.get('content-type') };
        }),
      confluence_download_content_attachments: (args) =>
        safeExec(() => client.getAttachments(args['pageId'] as string)),
      confluence_delete_attachment: (args) =>
        safeExec(async () => {
          await client.deleteAttachment(args['attachmentId'] as string);
          return { success: true };
        }),
      confluence_get_page_images: (args) =>
        safeExec(() => client.getPageImages(args['pageId'] as string)),
    },
  };
}
