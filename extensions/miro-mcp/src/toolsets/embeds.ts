import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createEmbedsToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_embeds',
      resourceName: 'embed',
      toolPrefix: 'miro',
      resourceSlug: 'embed',
      methodPrefix: 'Embed',
      apiPath: 'embeds',
    },
    client,
  );
}
