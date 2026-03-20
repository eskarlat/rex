import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createAppCardsToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_app_cards',
      resourceName: 'app card',
      toolPrefix: 'miro',
      resourceSlug: 'app_card',
      methodPrefix: 'AppCard',
      apiPath: 'app_cards',
    },
    client,
  );
}
