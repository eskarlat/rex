import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createCardsToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_cards',
      resourceName: 'card',
      toolPrefix: 'miro',
      resourceSlug: 'card',
      methodPrefix: 'Card',
      apiPath: 'cards',
    },
    client,
  );
}
