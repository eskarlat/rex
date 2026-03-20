import { createCrudToolset } from './crud-factory.js';
export function createMindmapsToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_mindmaps',
        resourceName: 'mindmap node',
        toolPrefix: 'miro',
        resourceSlug: 'mindmap_node',
        methodPrefix: 'MindmapNode',
        apiPath: 'mindmap_nodes',
    }, client);
}
