import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createShapesToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_shapes',
      resourceName: 'shape',
      toolPrefix: 'miro',
      resourceSlug: 'shape',
      methodPrefix: 'Shape',
      apiPath: 'shapes',
    },
    client,
  );
}
