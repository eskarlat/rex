import type { MiroClient } from '../client/miro-client.js';
import type { Toolset } from './types.js';
import { createCrudToolset } from './crud-factory.js';

export function createMindmapsToolset(client: MiroClient): Toolset {
  return createCrudToolset(
    {
      toolsetName: 'miro_mindmaps',
      resourceName: 'mindmap node',
      toolPrefix: 'miro',
      resourceSlug: 'mindmap_node',
      methodPrefix: 'MindmapNode',
      apiPath: 'mindmap_nodes',
    },
    client,
  );
}
