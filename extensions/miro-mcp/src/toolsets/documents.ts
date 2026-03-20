import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createDocumentsToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_documents',
      resourceName: 'document',
      toolPrefix: 'miro',
      resourceSlug: 'document',
      methodPrefix: 'Document',
      apiPath: 'documents',
    },
    client,
  );
}
