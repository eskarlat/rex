import { jsonToMarkdown } from '@renre-kit/extension-sdk/node';
export function textResult(data) {
    return {
        content: [
            { type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) },
        ],
    };
}
/** Converts data to LLM-friendly Markdown instead of raw JSON */
export function markdownResult(data, options) {
    return {
        content: [{ type: 'text', text: jsonToMarkdown(data, { filterNoise: true, ...options }) }],
    };
}
export function errorResult(message) {
    return {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
}
