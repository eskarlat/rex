import { defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  handler: async () => ({
    output: 'hello-world v1.0.0 — A simple hello world extension for RenreKit',
    exitCode: 0,
  }),
});
