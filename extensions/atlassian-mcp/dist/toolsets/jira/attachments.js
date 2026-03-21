import { markdownResult, errorResult } from '../types.js';
export function createAttachmentsToolset(client) {
    return {
        name: 'jira_attachments',
        tools: [
            {
                name: 'jira_download_attachments',
                description: 'Download an attachment from a Jira issue by attachment ID.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        attachmentId: { type: 'string', description: 'Attachment ID' },
                    },
                    required: ['attachmentId'],
                },
            },
            {
                name: 'jira_get_issue_images',
                description: 'Get all image attachments for a Jira issue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                    },
                    required: ['issueKey'],
                },
            },
        ],
        handlers: {
            jira_download_attachments: async (args) => {
                try {
                    const res = await client.downloadAttachment(args['attachmentId']);
                    const text = await res.text();
                    return markdownResult({ content: text, contentType: res.headers.get('content-type') });
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_issue_images: async (args) => {
                try {
                    const data = (await client.getIssueForAttachments(args['issueKey']));
                    const fields = data['fields'];
                    const attachments = (fields?.['attachment'] ?? []);
                    const images = attachments.filter((a) => {
                        const mimeType = a['mimeType'];
                        return mimeType?.startsWith('image/');
                    });
                    return markdownResult(images);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
