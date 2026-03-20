function textResult(data) {
    return {
        content: [
            { type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) },
        ],
    };
}
export function errorResult(message) {
    return {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
}
/**
 * Creates a tool handler that wraps a client call with try/catch error handling.
 * Eliminates boilerplate duplication across toolset handlers.
 */
export function createHandler(fn) {
    return async (args) => {
        try {
            const data = await fn(args);
            return textResult(data ?? 'Success');
        }
        catch (err) {
            return errorResult(err instanceof Error ? err.message : String(err));
        }
    };
}
