import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createFramesToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_frames',
      resourceName: 'frame',
      toolPrefix: 'miro',
      resourceSlug: 'frame',
      methodPrefix: 'Frame',
      apiPath: 'frames',
    },
    client,
  );
}
