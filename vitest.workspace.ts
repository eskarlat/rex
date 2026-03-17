import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/cli',
  'packages/server',
  'packages/ui',
  'packages/extension-sdk',
]);
