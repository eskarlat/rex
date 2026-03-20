export function textResult(data) {
    return {
        content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
    };
}
export function errorResult(message) {
    return {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
}
