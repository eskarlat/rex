import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createTextToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_text',
      resourceName: 'text item',
      toolPrefix: 'miro',
      resourceSlug: 'text',
      methodPrefix: 'Text',
      apiPath: 'texts',
    },
    client,
  );
}
