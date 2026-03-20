import { createCrudToolset } from './crud-factory.js';
export function createShapesToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_shapes',
        resourceName: 'shape',
        toolPrefix: 'miro',
        resourceSlug: 'shape',
        methodPrefix: 'Shape',
        apiPath: 'shapes',
    }, client);
}
