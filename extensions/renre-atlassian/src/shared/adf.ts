/** Build a simple ADF (Atlassian Document Format) document with a single paragraph */
export function buildAdfBody(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}
