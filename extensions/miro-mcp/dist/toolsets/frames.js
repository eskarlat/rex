import { createCrudToolset } from './crud-factory.js';
export function createFramesToolset(client) {
    return createCrudToolset({
        toolsetName: 'miro_frames',
        resourceName: 'frame',
        toolPrefix: 'miro',
        resourceSlug: 'frame',
        methodPrefix: 'Frame',
        apiPath: 'frames',
    }, client);
}
