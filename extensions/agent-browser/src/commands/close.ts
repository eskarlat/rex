import { defineCommand } from '@renre-kit/extension-sdk/node';

import { browserCommand } from '../shared/command-helper.js';

export default defineCommand({
  handler: (ctx) => browserCommand(ctx, ['close']),
});
